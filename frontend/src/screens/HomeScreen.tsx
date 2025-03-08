import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';

// Contexts
import { useSettings } from '../context/SettingsContext';
import { useBackup } from '../context/BackupContext';

// Components
import BackupProgressBar from '../components/BackupProgressBar';
import NoServerConnection from '../components/NoServerConnection';
import MediaItem from '../components/MediaItem';

const HomeScreen: React.FC = () => {
  const isFocused = useIsFocused();
  const { settings, isServerReachable, checkServerConnection } = useSettings();
  const { 
    newAssets, 
    selectedAssets, 
    backupProgress, 
    loadNewAssets, 
    toggleAssetSelection, 
    selectAllAssets, 
    deselectAllAssets, 
    startBackup, 
    cancelBackup, 
    ignoreAssets 
  } = useBackup();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWifiConnected, setIsWifiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check network and load assets when the screen is focused
  useEffect(() => {
    if (isFocused) {
      checkNetworkAndLoadAssets();
    }
  }, [isFocused]);
  
  // Check Wi-Fi connection and load assets
  const checkNetworkAndLoadAssets = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're on Wi-Fi
      const networkState = await Network.getNetworkStateAsync();
      setIsWifiConnected(networkState.type === Network.NetworkStateType.WIFI);
      
      // Check server connection
      if (networkState.type === Network.NetworkStateType.WIFI && settings.serverIP) {
        await checkServerConnection();
      }
      
      // Load new assets
      await loadNewAssets();
    } catch (error) {
      console.error('Error checking network:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkNetworkAndLoadAssets();
    setIsRefreshing(false);
  };
  
  // Start backup process
  const handleStartBackup = () => {
    if (selectedAssets.length === 0) {
      Alert.alert('No Selection', 'Please select at least one photo or video to back up.');
      return;
    }
    
    startBackup();
  };
  
  // Ignore selected assets
  const handleIgnoreSelected = () => {
    if (selectedAssets.length === 0) {
      return;
    }
    
    Alert.alert(
      'Ignore Selected',
      `Are you sure you want to ignore ${selectedAssets.length} selected items? They will not be suggested for backup in the future.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Ignore', 
          style: 'destructive', 
          onPress: () => ignoreAssets(selectedAssets.map(asset => asset.id)) 
        },
      ]
    );
  };
  
  // Render server status message
  const renderServerStatusMessage = () => {
    if (!isWifiConnected) {
      return (
        <View className="bg-warning/20 p-4 rounded-lg mb-4">
          <Text className="text-warning font-semibold">
            Not connected to Wi-Fi. Connect to your home network to back up photos.
          </Text>
        </View>
      );
    }
    
    if (!settings.serverIP) {
      return <NoServerConnection />;
    }
    
    if (!isServerReachable) {
      return (
        <View className="bg-error/20 p-4 rounded-lg mb-4">
          <Text className="text-error font-semibold">
            Cannot connect to server at {settings.serverIP}:{settings.serverPort}.
          </Text>
          <Text className="text-error mt-1">
            Make sure your server is running and you're on the same network.
          </Text>
        </View>
      );
    }
    
    return null;
  };
  
  // Render empty state message
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color="#3498db" />
          <Text className="text-text mt-4 text-center">Loading your photos and videos...</Text>
        </View>
      );
    }
    
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Ionicons name="checkmark-circle" size={64} color="#2ecc71" />
        <Text className="text-text text-lg font-semibold mt-4 text-center">
          All caught up!
        </Text>
        <Text className="text-text/70 text-center mt-2">
          There are no new photos or videos to back up.
        </Text>
        <TouchableOpacity
          className="bg-primary mt-6 py-3 px-6 rounded-full"
          onPress={handleRefresh}
        >
          <Text className="text-white font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View className="flex-1 bg-background">
      {/* Server status message */}
      {renderServerStatusMessage()}
      
      {/* Backup progress bar */}
      {backupProgress.inProgress && (
        <BackupProgressBar
          progress={backupProgress.percentage}
          fileName={backupProgress.currentFileName}
          currentFile={backupProgress.currentFile}
          totalFiles={backupProgress.totalFiles}
          onCancel={cancelBackup}
        />
      )}
      
      {/* Control buttons */}
      {newAssets.length > 0 && !backupProgress.inProgress && (
        <View className="flex-row justify-between items-center p-4">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="bg-primary/10 p-2 rounded-full"
              onPress={selectAllAssets}
            >
              <Ionicons name="checkmark-circle" size={22} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary/10 p-2 rounded-full"
              onPress={deselectAllAssets}
            >
              <Ionicons name="close-circle" size={22} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="bg-error p-2 px-4 rounded-full"
              onPress={handleIgnoreSelected}
            >
              <Text className="text-white text-sm font-semibold">Ignore Selected</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary p-2 px-4 rounded-full"
              onPress={handleStartBackup}
              disabled={!isServerReachable || selectedAssets.length === 0}
            >
              <Text className="text-white text-sm font-semibold">
                Back Up ({selectedAssets.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Photo/video grid */}
      <FlatList
        data={newAssets}
        renderItem={({ item }) => (
          <MediaItem
            asset={item}
            isSelected={!!item.selected}
            onToggleSelection={() => toggleAssetSelection(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 2 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      />
    </View>
  );
};

export default HomeScreen; 