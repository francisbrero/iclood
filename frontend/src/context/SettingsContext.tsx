import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Alert } from 'react-native';

interface SettingsState {
  serverIP: string;
  serverPort: string;
  autoBackup: boolean;
  wifiOnlyBackup: boolean;
  chargingOnlyBackup: boolean;
  storageLimit: number;
  originalQuality: boolean;
  backgroundRefresh: boolean;
  refreshInterval: number;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
  isServerReachable: boolean;
  checkServerConnection: () => Promise<boolean>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: SettingsState = {
  serverIP: '',
  serverPort: '8080',
  autoBackup: true,
  wifiOnlyBackup: true,
  chargingOnlyBackup: false,
  storageLimit: 99, // percentage of storage to use
  originalQuality: true,
  backgroundRefresh: true,
  refreshInterval: 60, // minutes
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  isServerReachable: false,
  checkServerConnection: async () => false,
  resetSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isServerReachable, setIsServerReachable] = useState<boolean>(false);

  // Load settings from storage on app launch
  useEffect(() => {
    loadSettings();
  }, []);

  // Automatically check server connection when server IP or port changes
  useEffect(() => {
    if (settings.serverIP && settings.serverPort) {
      checkServerConnection();
    }
  }, [settings.serverIP, settings.serverPort]);

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<SettingsState>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Failed to reset settings:', error);
      Alert.alert('Error', 'Failed to reset settings');
    }
  };

  // Check if the server is reachable
  const checkServerConnection = async (): Promise<boolean> => {
    if (!settings.serverIP) {
      setIsServerReachable(false);
      return false;
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Format the URL correctly
      let url = settings.serverIP;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
      }
      if (!url.includes(':' + settings.serverPort)) {
        url = `${url}:${settings.serverPort}`;
      }

      // Ping the server
      const response = await fetch(`${url}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const isReachable = response.status === 200;
      setIsServerReachable(isReachable);
      return isReachable;
    } catch (error) {
      console.error('Server connection check failed:', error);
      setIsServerReachable(false);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isServerReachable,
        checkServerConnection,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}; 