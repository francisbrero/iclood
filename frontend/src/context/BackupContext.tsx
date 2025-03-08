import React, { createContext, useState, useContext, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Device from 'expo-device';
import { Alert } from 'react-native';
import { useSettings } from './SettingsContext';

// Types for media assets
interface MediaAsset {
  id: string;
  uri: string;
  path: string;
  filename: string;
  fileSize: number;
  creationTime: number;
  modificationTime: number;
  mediaType: 'photo' | 'video';
  duration?: number;
  width: number;
  height: number;
  selected?: boolean;
}

interface BackupStats {
  totalFiles: number;
  totalSize: number;
  photosCount: number;
  videosCount: number;
  lastBackupTime: string | null;
}

interface BackupProgress {
  inProgress: boolean;
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  percentage: number;
}

interface BackupContextType {
  newAssets: MediaAsset[];
  selectedAssets: MediaAsset[];
  backupStats: BackupStats;
  backupProgress: BackupProgress;
  loadNewAssets: () => Promise<void>;
  toggleAssetSelection: (id: string) => void;
  selectAllAssets: () => void;
  deselectAllAssets: () => void;
  startBackup: () => Promise<void>;
  cancelBackup: () => void;
  ignoreAssets: (assetIds: string[]) => Promise<void>;
}

const initialBackupStats: BackupStats = {
  totalFiles: 0,
  totalSize: 0,
  photosCount: 0,
  videosCount: 0,
  lastBackupTime: null,
};

const initialBackupProgress: BackupProgress = {
  inProgress: false,
  currentFile: 0,
  totalFiles: 0,
  currentFileName: '',
  percentage: 0,
};

const BackupContext = createContext<BackupContextType>({
  newAssets: [],
  selectedAssets: [],
  backupStats: initialBackupStats,
  backupProgress: initialBackupProgress,
  loadNewAssets: async () => {},
  toggleAssetSelection: () => {},
  selectAllAssets: () => {},
  deselectAllAssets: () => {},
  startBackup: async () => {},
  cancelBackup: () => {},
  ignoreAssets: async () => {},
});

export const useBackup = () => useContext(BackupContext);

export const BackupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, isServerReachable } = useSettings();
  const [newAssets, setNewAssets] = useState<MediaAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [backupStats, setBackupStats] = useState<BackupStats>(initialBackupStats);
  const [backupProgress, setBackupProgress] = useState<BackupProgress>(initialBackupProgress);
  const [cancelBackupFlag, setCancelBackupFlag] = useState<boolean>(false);

  // Load backup stats from server when server is reachable
  useEffect(() => {
    if (isServerReachable) {
      fetchBackupStats();
    }
  }, [isServerReachable]);

  // Fetch backup stats from the server
  const fetchBackupStats = async () => {
    if (!settings.serverIP || !isServerReachable) return;

    try {
      const response = await fetch(`http://${settings.serverIP}:${settings.serverPort}/storage/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setBackupStats({
            totalFiles: data.backups.total_count || 0,
            totalSize: data.backups.total_size_bytes || 0,
            photosCount: data.backups.photo_count || 0,
            videosCount: data.backups.video_count || 0,
            lastBackupTime: data.backups.last_backup || null,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch backup stats:', error);
    }
  };

  // Function to load new assets from the device
  const loadNewAssets = async () => {
    try {
      // Get media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant access to your media library to use this app.');
        return;
      }

      // Get all assets
      const fetchedAssets = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [['creationTime', false]],
        first: 100, // Limit to the most recent 100 assets for performance
      });

      // Prepare assets data
      const assetsData: MediaAsset[] = await Promise.all(
        fetchedAssets.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          return {
            id: asset.id,
            uri: asset.uri,
            path: assetInfo.localUri || asset.uri,
            filename: asset.filename,
            fileSize: asset.fileSize || 0,
            creationTime: asset.creationTime,
            modificationTime: asset.modificationTime,
            mediaType: asset.mediaType === 'video' ? 'video' : 'photo',
            duration: asset.duration,
            width: asset.width,
            height: asset.height,
            selected: true, // Default to selected
          };
        })
      );

      // Check which assets need to be backed up
      if (isServerReachable && settings.serverIP) {
        try {
          const response = await fetch(`http://${settings.serverIP}:${settings.serverPort}/photos/new`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_id: Device.modelName,
              files: assetsData.map(asset => ({
                id: asset.id,
                path: asset.path,
                name: asset.filename,
                size: asset.fileSize,
                type: asset.mediaType,
                created: asset.creationTime,
              })),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              const newFileIds = new Set(data.new_files.map((file: any) => file.id));
              
              // Filter assets that need to be backed up
              const assetsToBackup = assetsData.filter(asset => newFileIds.has(asset.id));
              setNewAssets(assetsToBackup);
              setSelectedAssets(assetsToBackup);
              return;
            }
          }
        } catch (error) {
          console.error('Failed to check new files:', error);
        }
      }

      // If server is not reachable or API call failed, set all assets as new
      setNewAssets(assetsData);
      setSelectedAssets(assetsData);
    } catch (error) {
      console.error('Error loading assets:', error);
      Alert.alert('Error', 'Failed to load media files');
    }
  };

  // Function to toggle asset selection
  const toggleAssetSelection = (id: string) => {
    setNewAssets(prevAssets =>
      prevAssets.map(asset => {
        if (asset.id === id) {
          const newSelected = !asset.selected;
          // Update selected assets array
          if (newSelected) {
            setSelectedAssets(prev => [...prev, asset]);
          } else {
            setSelectedAssets(prev => prev.filter(a => a.id !== id));
          }
          return { ...asset, selected: newSelected };
        }
        return asset;
      })
    );
  };

  // Function to select all assets
  const selectAllAssets = () => {
    setNewAssets(prevAssets =>
      prevAssets.map(asset => ({ ...asset, selected: true }))
    );
    setSelectedAssets(newAssets);
  };

  // Function to deselect all assets
  const deselectAllAssets = () => {
    setNewAssets(prevAssets =>
      prevAssets.map(asset => ({ ...asset, selected: false }))
    );
    setSelectedAssets([]);
  };

  // Function to start backup process
  const startBackup = async () => {
    if (!isServerReachable || !settings.serverIP) {
      Alert.alert('Error', 'Server is not reachable. Check your connection and server settings.');
      return;
    }

    if (selectedAssets.length === 0) {
      Alert.alert('No Assets', 'No assets selected for backup.');
      return;
    }

    // Reset cancel flag
    setCancelBackupFlag(false);

    // Start backup process
    setBackupProgress({
      inProgress: true,
      currentFile: 0,
      totalFiles: selectedAssets.length,
      currentFileName: '',
      percentage: 0,
    });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < selectedAssets.length; i++) {
      // Check if backup was canceled
      if (cancelBackupFlag) {
        break;
      }

      const asset = selectedAssets[i];
      
      // Update progress
      setBackupProgress(prev => ({
        ...prev,
        currentFile: i + 1,
        currentFileName: asset.filename,
        percentage: Math.round(((i + 1) / selectedAssets.length) * 100),
      }));

      try {
        // Get the file info
        const fileInfo = await FileSystem.getInfoAsync(asset.path);
        if (!fileInfo.exists) {
          failedCount++;
          continue;
        }

        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', {
          uri: asset.path,
          name: asset.filename,
          type: asset.mediaType === 'photo' ? 'image/jpeg' : 'video/mp4',
        } as any);
        formData.append('original_path', asset.path);
        formData.append('file_type', asset.mediaType);
        formData.append('device_id', Device.modelName || 'unknown');

        // Upload the file
        const response = await fetch(`http://${settings.serverIP}:${settings.serverPort}/photos/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to upload asset ${asset.filename}:`, error);
        failedCount++;
      }
    }

    // Complete backup process
    setBackupProgress(initialBackupProgress);
    
    // Refresh backup stats
    fetchBackupStats();
    
    // Show completion alert
    Alert.alert(
      'Backup Complete',
      `Successfully backed up ${successCount} files. ${failedCount > 0 ? `Failed to backup ${failedCount} files.` : ''}`
    );
    
    // Refresh asset list
    loadNewAssets();
  };

  // Function to cancel ongoing backup
  const cancelBackup = () => {
    setCancelBackupFlag(true);
    Alert.alert('Backup Canceled', 'The backup process has been canceled.');
  };

  // Function to ignore assets
  const ignoreAssets = async (assetIds: string[]) => {
    if (!isServerReachable || !settings.serverIP || assetIds.length === 0) {
      return;
    }

    try {
      // Get assets to ignore
      const assetsToIgnore = newAssets.filter(asset => assetIds.includes(asset.id));

      // Send ignore request to server
      const response = await fetch(`http://${settings.serverIP}:${settings.serverPort}/photos/ignore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: Device.modelName,
          files: assetsToIgnore.map(asset => ({
            id: asset.id,
            path: asset.path,
            name: asset.filename,
          })),
        }),
      });

      if (response.ok) {
        // Remove ignored assets from the lists
        setNewAssets(prev => prev.filter(asset => !assetIds.includes(asset.id)));
        setSelectedAssets(prev => prev.filter(asset => !assetIds.includes(asset.id)));
      }
    } catch (error) {
      console.error('Failed to ignore assets:', error);
    }
  };

  return (
    <BackupContext.Provider
      value={{
        newAssets,
        selectedAssets,
        backupStats,
        backupProgress,
        loadNewAssets,
        toggleAssetSelection,
        selectAllAssets,
        deselectAllAssets,
        startBackup,
        cancelBackup,
        ignoreAssets,
      }}
    >
      {children}
    </BackupContext.Provider>
  );
}; 