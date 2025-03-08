import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import * as Device from 'expo-device';

// Contexts
import { useSettings } from '../context/SettingsContext';

// Components
import SettingsItem from '../components/SettingsItem';

type RootStackParamList = {
  ServerSetup: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { settings, updateSettings, isServerReachable, checkServerConnection, resetSettings } = useSettings();
  const [localStorageLimit, setLocalStorageLimit] = useState(settings.storageLimit);
  
  // Handle server setup button press
  const handleServerSetupPress = () => {
    navigation.navigate('ServerSetup');
  };
  
  // Handle storage limit change
  const handleStorageLimitChange = (value: number) => {
    setLocalStorageLimit(value);
  };
  
  // Apply storage limit change
  const handleStorageLimitComplete = () => {
    updateSettings({ storageLimit: localStorageLimit });
  };
  
  // Handle auto backup toggle
  const handleAutoBackupToggle = (value: boolean) => {
    updateSettings({ autoBackup: value });
  };
  
  // Handle wifi only toggle
  const handleWifiOnlyToggle = (value: boolean) => {
    updateSettings({ wifiOnlyBackup: value });
  };
  
  // Handle charging only toggle
  const handleChargingOnlyToggle = (value: boolean) => {
    updateSettings({ chargingOnlyBackup: value });
  };
  
  // Handle original quality toggle
  const handleOriginalQualityToggle = (value: boolean) => {
    updateSettings({ originalQuality: value });
  };
  
  // Handle background refresh toggle
  const handleBackgroundRefreshToggle = (value: boolean) => {
    updateSettings({ backgroundRefresh: value });
  };
  
  // Handle refresh interval change
  const handleRefreshIntervalChange = (value: number) => {
    updateSettings({ refreshInterval: value });
  };
  
  // Handle reset settings
  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: resetSettings
        },
      ]
    );
  };
  
  return (
    <ScrollView className="flex-1 bg-background">
      {/* Server Connection Section */}
      <View className="p-4 pt-2">
        <Text className="text-lg font-semibold text-text mb-2">Server Connection</Text>
        
        <View className="bg-card rounded-lg p-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-text font-medium">Server Status</Text>
              <Text className="text-xs text-text/60">
                {settings.serverIP 
                  ? `${settings.serverIP}:${settings.serverPort}` 
                  : 'Not configured'}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              {isServerReachable 
                ? <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                : <Ionicons name="close-circle" size={20} color="#e74c3c" />
              }
              <Text className="ml-1 text-sm">
                {isServerReachable ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            className="bg-primary mt-3 p-2 rounded-lg flex-row justify-center items-center"
            onPress={handleServerSetupPress}
          >
            <Ionicons name="server-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Configure Server</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Backup Settings Section */}
      <View className="p-4 pt-2">
        <Text className="text-lg font-semibold text-text mb-2">Backup Settings</Text>
        
        <View className="bg-card rounded-lg p-4 shadow-sm">
          <SettingsItem
            title="Auto Backup"
            description="Automatically back up new photos and videos"
            icon="cloud-upload-outline"
            iconColor="#3498db"
          >
            <Switch
              value={settings.autoBackup}
              onValueChange={handleAutoBackupToggle}
              trackColor={{ false: '#95a5a6', true: '#3498db' }}
              thumbColor="white"
            />
          </SettingsItem>
          
          <SettingsItem
            title="Wi-Fi Only"
            description="Only back up when connected to Wi-Fi"
            icon="wifi-outline"
            iconColor="#2ecc71"
          >
            <Switch
              value={settings.wifiOnlyBackup}
              onValueChange={handleWifiOnlyToggle}
              trackColor={{ false: '#95a5a6', true: '#2ecc71' }}
              thumbColor="white"
            />
          </SettingsItem>
          
          <SettingsItem
            title="While Charging Only"
            description="Only back up when the device is charging"
            icon="battery-charging-outline"
            iconColor="#f39c12"
          >
            <Switch
              value={settings.chargingOnlyBackup}
              onValueChange={handleChargingOnlyToggle}
              trackColor={{ false: '#95a5a6', true: '#f39c12' }}
              thumbColor="white"
            />
          </SettingsItem>
          
          <SettingsItem
            title="Original Quality"
            description="Back up photos and videos in their original quality"
            icon="image-outline"
            iconColor="#9b59b6"
          >
            <Switch
              value={settings.originalQuality}
              onValueChange={handleOriginalQualityToggle}
              trackColor={{ false: '#95a5a6', true: '#9b59b6' }}
              thumbColor="white"
            />
          </SettingsItem>
          
          <View className="py-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-medium text-text">Storage Limit</Text>
              <Text className="text-sm text-text/60">{localStorageLimit}%</Text>
            </View>
            <Slider
              minimumValue={10}
              maximumValue={95}
              step={5}
              value={localStorageLimit}
              onValueChange={handleStorageLimitChange}
              onSlidingComplete={handleStorageLimitComplete}
              minimumTrackTintColor="#3498db"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#3498db"
              style={{ height: 40 }}
            />
            <Text className="text-xs text-text/60">
              Stop backing up when server storage usage exceeds this percentage
            </Text>
          </View>
        </View>
      </View>
      
      {/* Background Activity Section */}
      <View className="p-4 pt-2">
        <Text className="text-lg font-semibold text-text mb-2">Background Activity</Text>
        
        <View className="bg-card rounded-lg p-4 shadow-sm">
          <SettingsItem
            title="Background Refresh"
            description="Check for new photos periodically in the background"
            icon="refresh-outline"
            iconColor="#3498db"
          >
            <Switch
              value={settings.backgroundRefresh}
              onValueChange={handleBackgroundRefreshToggle}
              trackColor={{ false: '#95a5a6', true: '#3498db' }}
              thumbColor="white"
            />
          </SettingsItem>
          
          <View className="py-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-medium text-text">Refresh Interval</Text>
              <Text className="text-sm text-text/60">
                {settings.refreshInterval} {settings.refreshInterval === 1 ? 'minute' : 'minutes'}
              </Text>
            </View>
            <Slider
              minimumValue={15}
              maximumValue={120}
              step={15}
              value={settings.refreshInterval}
              onValueChange={handleRefreshIntervalChange}
              minimumTrackTintColor="#3498db"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#3498db"
              style={{ height: 40 }}
              disabled={!settings.backgroundRefresh}
            />
          </View>
        </View>
      </View>
      
      {/* About Section */}
      <View className="p-4 pt-2 mb-8">
        <Text className="text-lg font-semibold text-text mb-2">About</Text>
        
        <View className="bg-card rounded-lg p-4 shadow-sm">
          <View className="items-center py-2">
            <Text className="text-xl font-bold text-primary">iClood</Text>
            <Text className="text-sm text-text/60 mt-1">Version 1.0.0</Text>
            <Text className="text-xs text-text/60 mt-1">
              Device: {Device.modelName} ({Platform.OS} {Platform.Version})
            </Text>
          </View>
          
          <TouchableOpacity
            className="bg-error/10 mt-6 p-3 rounded-lg flex-row justify-center items-center"
            onPress={handleResetSettings}
          >
            <Ionicons name="refresh-circle-outline" size={20} color="#e74c3c" />
            <Text className="text-error font-semibold ml-2">Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen; 