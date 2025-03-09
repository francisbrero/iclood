import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageUsageBar from '../components/StorageUsageBar';
import BackupHistoryItem from '../components/BackupHistoryItem';
import NoServerConnection from '../components/NoServerConnection';
import { formatDateTime } from '../utils/formatting';
import { useStorageScreen } from '../hooks/useStorageScreen';
import { BackupHistoryItem as BackupHistoryItemType } from '../types';

interface StorageWarning {
  warningMessage: string;
  warningColor: 'error' | 'warning';
}

const StorageScreen: React.FC = () => {
  const {
    isLoading,
    isRefreshing,
    isServerReachable,
    settings,
    storageUsage,
    backupStats,
    backupHistory,
    handleRefresh,
    renderStorageWarning
  } = useStorageScreen();

  // Render content
  const renderContent = () => {
    if (!isServerReachable || !settings.serverIP) {
      return <NoServerConnection />;
    }
    
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Loading storage information...</Text>
        </View>
      );
    }
    
    if (!storageUsage) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="cloud-offline-outline" size={40} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>
            Storage Information Unavailable
          </Text>
          <Text style={styles.errorMessage}>
            We couldn't retrieve storage information from your server
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const warning = renderStorageWarning();
    
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0066FF']}
            tintColor="#0066FF"
          />
        }
      >
        {/* Storage Warning */}
        {warning && (
          <View style={[styles.warningContainer, { backgroundColor: warning.warningColor === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
            <Text style={[styles.warningText, { color: warning.warningColor === 'error' ? '#EF4444' : '#F59E0B' }]}>
              {warning.warningMessage}
            </Text>
          </View>
        )}
        
        {/* Storage Usage Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="pie-chart-outline" size={20} color="#0066FF" />
            </View>
            <Text style={styles.cardTitle}>Storage Usage</Text>
          </View>
          
          <StorageUsageBar
            totalSpace={storageUsage.total_bytes}
            usedSpace={storageUsage.used_bytes}
            iCloodSpace={storageUsage.icloud_used_bytes || 0}
            warningThreshold={settings.storageLimit}
          />
          
          <View style={styles.statsContainer}>
            <View>
              <Text style={styles.statLabel}>Used</Text>
              <Text style={styles.statValue}>{storageUsage.used_human}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>iClood</Text>
              <Text style={[styles.statValue, styles.primaryText]}>{storageUsage.icloud_used_human}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Free</Text>
              <Text style={styles.statValue}>{storageUsage.free_human}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{storageUsage.total_human}</Text>
            </View>
          </View>
        </View>
        
        {/* Backup Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart-outline" size={20} color="#0066FF" />
            </View>
            <Text style={styles.cardTitle}>Backup Statistics</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{backupStats.totalFiles}</Text>
              <Text style={styles.statLabel}>Total Files</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{backupStats.photosCount}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{backupStats.videosCount}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
          </View>
          
          <View style={styles.lastBackupContainer}>
            <Text style={styles.statLabel}>Last Backup</Text>
            <Text style={styles.statValue}>
              {backupStats.lastBackupTime 
                ? formatDateTime(new Date(backupStats.lastBackupTime))
                : 'Never'}
            </Text>
          </View>
        </View>
        
        {/* Recent Backups Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={20} color="#0066FF" />
            </View>
            <Text style={styles.cardTitle}>Recent Backups</Text>
          </View>
          
          {backupHistory.length > 0 ? (
            backupHistory.map((backup: BackupHistoryItemType, index: number) => (
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent backups found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };
  
  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#334155',
    textAlign: 'center',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginTop: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0066FF',
  },
  primaryText: {
    color: '#0066FF',
  },
  lastBackupContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
  },
  warningContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StorageScreen; 