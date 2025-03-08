import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

// Contexts
import { useSettings } from '../context/SettingsContext';
import { useBackup } from '../context/BackupContext';

// Components
import StorageUsageBar from '../components/StorageUsageBar';
import BackupHistoryItem from '../components/BackupHistoryItem';
import NoServerConnection from '../components/NoServerConnection';

// Helpers
import { formatDateTime, formatFileSize } from '../utils/formatting';

const StorageScreen: React.FC = () => {
  const isFocused = useIsFocused();
  const { settings, isServerReachable, checkServerConnection } = useSettings();
  const { backupStats, loadNewAssets } = useBackup();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  
  // Refresh data when screen is focused
  useEffect(() => {
    if (isFocused) {
      fetchStorageData();
    }
  }, [isFocused, isServerReachable]);
  
  // Fetch storage data from server
  const fetchStorageData = async () => {
    if (!isServerReachable || !settings.serverIP) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch storage status
      const response = await fetch(`http://${settings.serverIP}:${settings.serverPort}/storage/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setStorageUsage(data.storage);
          
          // Calculate space used by iClood
          const iCloodSize = data.backups.total_size_bytes || 0;
          setStorageUsage(prev => ({
            ...prev,
            icloud_used_bytes: iCloodSize,
            icloud_used_human: formatFileSize(iCloodSize),
            icloud_percent: prev?.total_bytes ? Math.round((iCloodSize / prev.total_bytes) * 100) : 0,
          }));
        }
      }
      
      // Fetch backup history
      const historyResponse = await fetch(`http://${settings.serverIP}:${settings.serverPort}/backup/log?limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.status === 'success') {
          setBackupHistory(historyData.backups || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch storage data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkServerConnection();
    await fetchStorageData();
    setIsRefreshing(false);
  };
  
  // Calculate warning level based on storage usage
  const getWarningLevel = (): 'normal' | 'warning' | 'critical' => {
    if (!storageUsage) return 'normal';
    
    const usagePercent = storageUsage.usage_percent;
    if (usagePercent >= 90) return 'critical';
    if (usagePercent >= settings.storageLimit) return 'warning';
    return 'normal';
  };
  
  // Render storage warning message
  const renderStorageWarning = () => {
    const warningLevel = getWarningLevel();
    
    if (warningLevel === 'normal') return null;
    
    const isBackupDisabled = warningLevel === 'critical';
    const warningColor = warningLevel === 'critical' ? 'error' : 'warning';
    const warningMessage = isBackupDisabled 
      ? 'Storage is critically full. Backups are disabled.'
      : `Storage is almost full (above ${settings.storageLimit}%). Consider freeing up space.`;
    
    return (
      <View className={`bg-${warningColor}/20 p-4 rounded-lg mb-4`}>
        <Text className={`text-${warningColor} font-semibold`}>
          {warningMessage}
        </Text>
      </View>
    );
  };
  
  // Render content
  const renderContent = () => {
    if (!isServerReachable || !settings.serverIP) {
      return <NoServerConnection />;
    }
    
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color="#3498db" />
          <Text className="text-text mt-4 text-center">Loading storage information...</Text>
        </View>
      );
    }
    
    if (!storageUsage) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="cloud-offline-outline" size={64} color="#95a5a6" />
          <Text className="text-text text-lg font-semibold mt-4 text-center">
            Storage information unavailable
          </Text>
          <Text className="text-text/70 text-center mt-2">
            We couldn't retrieve storage information from your server.
          </Text>
          <TouchableOpacity
            className="bg-primary mt-6 py-3 px-6 rounded-full"
            onPress={handleRefresh}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <>
        {/* Storage Warning */}
        {renderStorageWarning()}
        
        {/* Storage Usage Card */}
        <View className="bg-card rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-text mb-4">Storage Usage</Text>
          
          <StorageUsageBar
            totalSpace={storageUsage.total_bytes}
            usedSpace={storageUsage.used_bytes}
            iCloodSpace={storageUsage.icloud_used_bytes || 0}
            warningThreshold={settings.storageLimit}
          />
          
          <View className="flex-row justify-between mt-4">
            <View>
              <Text className="text-xs text-text/60">Used</Text>
              <Text className="font-medium">{storageUsage.used_human}</Text>
            </View>
            <View>
              <Text className="text-xs text-text/60">iClood</Text>
              <Text className="font-medium">{storageUsage.icloud_used_human}</Text>
            </View>
            <View>
              <Text className="text-xs text-text/60">Free</Text>
              <Text className="font-medium">{storageUsage.free_human}</Text>
            </View>
            <View>
              <Text className="text-xs text-text/60">Total</Text>
              <Text className="font-medium">{storageUsage.total_human}</Text>
            </View>
          </View>
        </View>
        
        {/* Backup Stats Card */}
        <View className="bg-card rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-text mb-4">Backup Statistics</Text>
          
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-primary text-3xl font-bold">{backupStats.totalFiles}</Text>
              <Text className="text-text/60 text-sm">Total Files</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-secondary text-3xl font-bold">{backupStats.photosCount}</Text>
              <Text className="text-text/60 text-sm">Photos</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-accent text-3xl font-bold">{backupStats.videosCount}</Text>
              <Text className="text-text/60 text-sm">Videos</Text>
            </View>
          </View>
          
          <View className="mt-4 pt-4 border-t border-gray-100">
            <Text className="text-text/60 text-sm">Last Backup</Text>
            <Text className="font-medium">
              {backupStats.lastBackupTime 
                ? formatDateTime(new Date(backupStats.lastBackupTime))
                : 'Never'}
            </Text>
          </View>
        </View>
        
        {/* Recent Backups Card */}
        <View className="bg-card rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-text mb-4">Recent Backups</Text>
          
          {backupHistory.length > 0 ? (
            backupHistory.map((backup, index) => (
              <BackupHistoryItem
                key={backup.id}
                fileName={backup.file_name}
                fileSize={backup.file_size}
                fileType={backup.file_type}
                timestamp={new Date(backup.timestamp)}
                isLast={index === backupHistory.length - 1}
              />
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-text/60">No recent backups found</Text>
            </View>
          )}
        </View>
      </>
    );
  };
  
  return (
    <ScrollView 
      className="flex-1 bg-background p-4"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#3498db']}
          tintColor="#3498db"
        />
      }
    >
      {renderContent()}
    </ScrollView>
  );
};

export default StorageScreen; 