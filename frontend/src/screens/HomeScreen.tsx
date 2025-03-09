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
        <View className="px-6 pt-6">
          <View className="bg-primary-50 p-6 rounded-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-white justify-center items-center mr-4">
                  <Ionicons name="cloud-upload-outline" size={20} color="#0066FF" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-primary">Backing up...</Text>
                  <Text className="text-sm text-text-secondary mt-1">
                    {backupProgress.currentFile} of {backupProgress.totalFiles} files
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                className="w-8 h-8 rounded-full bg-white justify-center items-center"
                onPress={cancelBackup}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-sm text-text-secondary mb-3" numberOfLines={1} ellipsizeMode="middle">
              {backupProgress.currentFileName}
            </Text>
            
            <View className="h-2 bg-white rounded-full overflow-hidden">
              <View 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${backupProgress.percentage}%` }} 
              />
            </View>
          </View>
        </View>
      )}
      
      {/* Main content */}
      <View className="flex-1 px-6 pt-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-text">Your Photos</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-primary-50 justify-center items-center mr-2"
              onPress={selectAllAssets}
            >
              <Ionicons name="checkmark-circle" size={20} color="#0066FF" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-error/10 justify-center items-center"
              onPress={deselectAllAssets}
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {newAssets.length > 0 ? (
          <>
            <Text className="text-text-secondary mb-4">
              Select photos to back up to your storage server
            </Text>
            
            <View className="flex-row flex-wrap -mx-1">
              {newAssets.map(asset => (
                <MediaItem
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssets.includes(asset)}
                  onToggleSelection={() => toggleAssetSelection(asset.id)}
                />
              ))}
            </View>
            
            {selectedAssets.length > 0 && (
              <View className="absolute bottom-6 left-6 right-6 flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-error/10 p-4 rounded-2xl flex-row justify-center items-center"
                  onPress={handleIgnoreSelected}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text className="text-error font-semibold ml-2">
                    Ignore Selected
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-primary p-4 rounded-2xl flex-row justify-center items-center"
                  onPress={handleStartBackup}
                  disabled={!isServerReachable}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Back Up ({selectedAssets.length})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 justify-center items-center">
            <View className="w-20 h-20 rounded-full bg-success/10 justify-center items-center mb-4">
              <Ionicons name="checkmark" size={40} color="#10B981" />
            </View>
            <Text className="text-xl font-semibold text-text text-center">
              All Caught Up!
            </Text>
            <Text className="text-text-secondary text-center mt-2 mb-6">
              There are no new photos or videos to back up
            </Text>
            <TouchableOpacity
              className="bg-primary-50 px-6 py-3 rounded-full"
              onPress={handleRefresh}
            >
              <Text className="text-primary font-semibold">Check Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomeScreen; 