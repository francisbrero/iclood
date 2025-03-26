import React, { createContext, useState, useContext, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Device from 'expo-device';
import { Alert, Linking, Platform } from 'react-native';
import { useSettings } from './SettingsContext';

// Types for media assets
interface MediaAsset {
  id: string;
  uri: string;
  path: string;
  filename: string;
  fileSize?: number;
  creationTime: number;
  modificationTime: number;
  mediaType: 'photo' | 'video';
  duration?: number;
  width: number;
  height: number;
  selected?: boolean;
  ignored?: boolean;
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

interface StorageUsage {
  used_bytes: number;
  total_bytes: number;
  available_bytes: number;
}

interface BackupContextType {
  newAssets: MediaAsset[];
  selectedAssets: MediaAsset[];
  backupStats: BackupStats;
  backupProgress: BackupProgress;
  loadNewAssets: (limit?: number, after?: string) => Promise<boolean>;
  toggleAssetSelection: (id: string) => void;
  selectAllAssets: () => void;
  deselectAllAssets: () => void;
  startBackup: () => Promise<void>;
  cancelBackup: () => void;
  ignoreAssets: (assetIds: string[]) => Promise<void>;
  fetchStorageUsage: () => Promise<StorageUsage>;
  fetchBackupStats: () => Promise<BackupStats>;
  fetchBackupHistory: () => Promise<any[]>;
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
  loadNewAssets: async () => false,
  toggleAssetSelection: () => {},
  selectAllAssets: () => {},
  deselectAllAssets: () => {},
  startBackup: async () => {},
  cancelBackup: () => {},
  ignoreAssets: async () => {},
  fetchStorageUsage: async () => ({ used_bytes: 0, total_bytes: 0, available_bytes: 0 }),
  fetchBackupStats: async () => initialBackupStats,
  fetchBackupHistory: async () => [],
});

export const useBackup = () => useContext(BackupContext);

export const BackupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, isServerReachable } = useSettings();
  const [newAssets, setNewAssets] = useState<MediaAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [backupStats, setBackupStats] = useState<BackupStats>(initialBackupStats);
  const [backupProgress, setBackupProgress] = useState<BackupProgress>(initialBackupProgress);
  const [cancelBackupFlag, setCancelBackupFlag] = useState<boolean>(false);

  // Helper function to format server URL
  const getServerUrl = () => {
    let url = settings.serverIP;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    if (!url.includes(':' + settings.serverPort)) {
      url = `${url}:${settings.serverPort}`;
    }
    return url;
  };

  // Load backup stats from server when server is reachable
  useEffect(() => {
    if (isServerReachable) {
      fetchBackupStats();
    }
  }, [isServerReachable]);

  // Fetch backup stats from the server
  const fetchBackupStats = async (): Promise<BackupStats> => {
    if (!settings.serverIP || !isServerReachable) {
      return initialBackupStats;
    }

    try {
      const response = await fetch(`${getServerUrl()}/storage/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const stats = {
            totalFiles: data.backups.total_count || 0,
            totalSize: data.backups.total_size_bytes || 0,
            photosCount: data.backups.photo_count || 0,
            videosCount: data.backups.video_count || 0,
            lastBackupTime: data.backups.last_backup || null,
          };
          setBackupStats(stats);
          return stats;
        }
      }
    } catch (error) {
      console.error('Failed to fetch backup stats:', error);
    }

    return initialBackupStats;
  };

  // Function to load new assets from the device
  const loadNewAssets = async (limit = 20, after?: string) => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photos to use the backup feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      // Get all assets with pagination
      const fetchedAssets = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [['creationTime', false]],
        first: limit,
        after
      });

      // Get detailed info for each asset
      const assetsData: MediaAsset[] = await Promise.all(
        fetchedAssets.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          // Get the proper URI that works on iOS
          let properUri = asset.uri;
          if (Platform.OS === 'ios') {
            try {
              // Convert ph:// URL to a local file URL
              const localUri = await MediaLibrary.getAssetInfoAsync(asset);
              if (localUri.localUri) {
                properUri = localUri.localUri;
              }
            } catch (error) {
              console.error('Error getting local URI:', error);
            }
          }
          
          return {
            id: asset.id,
            uri: properUri,
            path: assetInfo.localUri || properUri,
            filename: asset.filename,
            fileSize: 0,
            creationTime: asset.creationTime,
            modificationTime: asset.modificationTime,
            mediaType: asset.mediaType === 'video' ? 'video' : 'photo',
            duration: asset.duration,
            width: asset.width,
            height: asset.height,
            selected: true
          };
        })
      );

      // If this is the first page, replace the assets
      // Otherwise, append the new assets
      if (after === undefined) {
        setNewAssets(assetsData);
        setSelectedAssets(assetsData);
      } else {
        setNewAssets(prev => [...prev, ...assetsData]);
        setSelectedAssets(prev => [...prev, ...assetsData]);
      }

      // If server is reachable, check which assets need backup
      if (isServerReachable && settings.serverIP) {
        try {
          const response = await fetch(`${getServerUrl()}/photos/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_id: Device.modelName || 'unknown',
              files: assetsData.map(asset => ({
                id: asset.id,
                path: asset.path,
                name: asset.filename,
                size: asset.fileSize,
                type: asset.mediaType,
                created: asset.creationTime
              }))
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              const newFileIds = new Set(data.new_files.map((file: any) => file.id));
              const ignoredFileIds = new Set(data.ignored_files?.map((file: any) => file.id) || []);
              
              // Only keep files that need backup (not backed up and not ignored)
              const assetsToShow = assetsData.filter(asset => 
                newFileIds.has(asset.id) && !ignoredFileIds.has(asset.id)
              ).map(asset => ({
                ...asset,
                selected: true
              }));
              
              if (after === undefined) {
                setNewAssets(assetsToShow);
                setSelectedAssets(assetsToShow);
              } else {
                setNewAssets(prev => [...prev, ...assetsToShow]);
                setSelectedAssets(prev => [...prev, ...assetsToShow]);
              }

              // Return hasNextPage only if we got some assets to show
              return fetchedAssets.hasNextPage && assetsToShow.length > 0;
            }
          }
        } catch (error) {
          console.error('Failed to check new files:', error);
        }
      }

      return fetchedAssets.hasNextPage;
    } catch (error) {
      console.error('Error loading assets:', error);
      Alert.alert('Error', 'Failed to load your photos and videos. Please try again.');
      return false;
    }
  };

  // Function to toggle asset selection
  const toggleAssetSelection = (id: string) => {
    const asset = newAssets.find(a => a.id === id);
    if (!asset) return;

    setNewAssets(prevAssets =>
      prevAssets.map(asset => {
        if (asset.id === id) {
          return { ...asset, selected: !asset.selected };
        }
        return asset;
      })
    );

    setSelectedAssets(prev => {
      const isCurrentlySelected = prev.some(a => a.id === id);
      if (isCurrentlySelected) {
        return prev.filter(a => a.id !== id);
      } else {
        return [...prev, asset];
      }
    });
  };

  // Function to select all assets
  const selectAllAssets = () => {
    setNewAssets(prevAssets =>
      prevAssets.map(asset => ({ ...asset, selected: true }))
    );
    // Use newAssets directly instead of the stale state
    setSelectedAssets([...newAssets]);
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
        const response = await fetch(`${getServerUrl()}/photos/upload`, {
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
    await fetchBackupStats();
    
    // Show completion alert
    Alert.alert(
      'Backup Complete',
      `Successfully backed up ${successCount} files. ${failedCount > 0 ? `Failed to backup ${failedCount} files.` : ''}`
    );
    
    // Reset page and reload assets
    setNewAssets([]);
    setSelectedAssets([]);
    await loadNewAssets();
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
      const response = await fetch(`${getServerUrl()}/photos/ignore`, {
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

  // Function to fetch storage usage
  const fetchStorageUsage = async (): Promise<StorageUsage> => {
    if (!settings.serverIP || !isServerReachable) {
      throw new Error('Server is not reachable');
    }

    const response = await fetch(`${getServerUrl()}/storage/usage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch storage usage');
    }

    const data = await response.json();
    return {
      used_bytes: data.used_bytes || 0,
      total_bytes: data.total_bytes || 0,
      available_bytes: data.available_bytes || 0,
    };
  };

  // Function to fetch backup history
  const fetchBackupHistory = async (): Promise<any[]> => {
    if (!settings.serverIP || !isServerReachable) {
      return [];
    }

    try {
      const response = await fetch(`${getServerUrl()}/backup/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.history || [];
      }
    } catch (error) {
      console.error('Failed to fetch backup history:', error);
    }

    return [];
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
        fetchStorageUsage,
        fetchBackupStats: fetchBackupStats,
        fetchBackupHistory,
      }}
    >
      {children}
    </BackupContext.Provider>
  );
}; 