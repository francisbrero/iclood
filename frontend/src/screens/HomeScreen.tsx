import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  StyleSheet
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

// Calculate number of columns based on screen width
const numColumns = Math.floor(Dimensions.get('window').width / 120); // Assuming each item is ~120px wide

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;
  
  // Check network and load initial assets when the screen is focused
  useEffect(() => {
    if (isFocused) {
      setPage(1);
      setHasMore(true);
      checkNetworkAndLoadAssets(1);
    }
  }, [isFocused]);
  
  // Check network and load assets
  const checkNetworkAndLoadAssets = async (currentPage: number) => {
    try {
      if (currentPage === 1) {
        setIsLoading(true);
      }
      
      // Check if we're on Wi-Fi
      const networkState = await Network.getNetworkStateAsync();
      setIsWifiConnected(networkState.type === Network.NetworkStateType.WIFI);
      
      // Check server connection
      if (networkState.type === Network.NetworkStateType.WIFI && settings.serverIP) {
        await checkServerConnection();
      }
      
      // Load new assets with pagination
      const hasNextPage = await loadNewAssets(ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE);
      setHasMore(hasNextPage);
    } catch (error) {
      console.error('Error checking network:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await checkNetworkAndLoadAssets(1);
    setIsRefreshing(false);
  };
  
  // Handle loading more items
  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      await checkNetworkAndLoadAssets(nextPage);
    }
  };
  
  // Render footer loader
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
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
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Cannot connect to server at {settings.serverIP}:{settings.serverPort}.
          </Text>
          <Text style={styles.errorSubtext}>
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading your photos and videos...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#2ecc71" />
        <Text style={styles.emptyTitle}>
          All caught up!
        </Text>
        <Text style={styles.emptySubtext}>
          There are no new photos or videos to back up.
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Server status message */}
      {renderServerStatusMessage()}
      
      {/* Backup progress bar */}
      {backupProgress.inProgress && (
        <View style={styles.progressContainer}>
          <BackupProgressBar 
            currentFile={backupProgress.currentFile}
            totalFiles={backupProgress.totalFiles}
            currentFileName={backupProgress.currentFileName}
            percentage={backupProgress.percentage}
            onCancel={cancelBackup}
          />
        </View>
      )}
      
      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Photos</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.headerButton, styles.selectButton]}
              onPress={selectAllAssets}
            >
              <Ionicons name="checkmark-circle" size={20} color="#0066FF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deselectButton]}
              onPress={deselectAllAssets}
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {newAssets.length > 0 ? (
          <>
            <Text style={styles.subtitle}>
              Select photos to back up to your storage server
            </Text>
            
            <FlatList
              data={newAssets}
              renderItem={({ item }) => (
                <MediaItem
                  key={item.id}
                  asset={item}
                  isSelected={item.selected || false}
                  onToggleSelection={() => toggleAssetSelection(item.id)}
                />
              )}
              keyExtractor={item => item.id}
              numColumns={numColumns}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              columnWrapperStyle={styles.row}
            />
          </>
        ) : (
          renderEmptyState()
        )}
      </View>
      
      {/* Bottom buttons */}
      {newAssets.length > 0 && (
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.ignoreButton}
            onPress={handleIgnoreSelected}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={styles.ignoreButtonText}>Ignore Selected</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backupButton}
            onPress={handleStartBackup}
          >
            <Text style={styles.backupButtonText}>
              Back Up ({selectedAssets.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#EFF6FF',
  },
  deselectButton: {
    backgroundColor: '#FEE2E2',
  },
  row: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  progressContainer: {
    padding: 16,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  ignoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  ignoreButtonText: {
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  backupButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backupButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    color: '#92400E',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  errorSubtext: {
    color: '#B91C1C',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen; 