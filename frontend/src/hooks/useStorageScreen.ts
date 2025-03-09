import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useBackup } from '../context/BackupContext';
import { StorageUsage, BackupStats, BackupHistoryItem } from '../types';
import { formatFileSize } from '../utils/formatting';

interface StorageWarning {
  warningMessage: string;
  warningColor: 'error' | 'warning';
}

export const useStorageScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [backupStats, setBackupStats] = useState<BackupStats>({
    totalFiles: 0,
    photosCount: 0,
    videosCount: 0,
    lastBackupTime: null,
  });
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([]);

  const { settings, isServerReachable, checkServerConnection } = useSettings();
  const { fetchStorageUsage, fetchBackupStats, fetchBackupHistory } = useBackup();

  const fetchData = useCallback(async () => {
    if (!isServerReachable || !settings.serverIP) {
      setIsLoading(false);
      return;
    }

    try {
      const [usage, stats, history] = await Promise.all([
        fetchStorageUsage(),
        fetchBackupStats(),
        fetchBackupHistory(),
      ]);

      setStorageUsage(usage);
      setBackupStats(stats);
      setBackupHistory(history);
    } catch (error) {
      console.error('Error fetching storage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isServerReachable, settings.serverIP, fetchStorageUsage, fetchBackupStats, fetchBackupHistory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await checkServerConnection();
    await fetchData();
    setIsRefreshing(false);
  }, [checkServerConnection, fetchData]);

  const renderStorageWarning = useCallback((): StorageWarning | null => {
    if (!storageUsage) return null;

    const usedPercentage = (storageUsage.used_bytes / storageUsage.total_bytes) * 100;
    const warningThreshold = settings.storageLimit;

    if (usedPercentage >= warningThreshold) {
      return {
        warningMessage: `Storage usage is at ${usedPercentage.toFixed(1)}%. Consider freeing up space.`,
        warningColor: usedPercentage >= 90 ? 'error' : 'warning',
      };
    }

    return null;
  }, [storageUsage, settings.storageLimit]);

  return {
    isLoading,
    isRefreshing,
    isServerReachable,
    settings,
    storageUsage,
    backupStats,
    backupHistory,
    handleRefresh,
    renderStorageWarning,
  };
}; 