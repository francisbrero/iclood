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
  Platform,
  StyleSheet
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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Connection</Text>
        <View style={styles.card}>
          <View style={styles.flexRowBetween}>
            <Text style={styles.fontMedium}>Server Status</Text>
            <Text style={[styles.textSmOpacity, isServerReachable ? styles.textSuccess : styles.textError]}>
              {isServerReachable ? 'Connected' : 'Not Connected'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleServerSetupPress}
          >
            <Text style={styles.buttonText}>Configure Server</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Backup Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup Settings</Text>
        <View style={styles.card}>
          <View style={styles.flexRowBetween}>
            <View>
              <Text style={styles.fontMedium}>Backup Status</Text>
              <Text style={styles.textXsOpacity}>
                {settings.serverIP 
                  ? `${settings.serverIP}:${settings.serverPort}` 
                  : 'Not configured'}
              </Text>
            </View>
            
            <View style={styles.flexRow}>
              {isServerReachable 
                ? <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                : <Ionicons name="close-circle" size={20} color="#e74c3c" />
              }
              <Text style={styles.statusText}>
                {isServerReachable ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Reset Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reset Settings</Text>
        <View style={styles.card}>
          <View style={styles.flexRowBetween}>
            <View>
              <Text style={styles.fontMedium}>Reset All Settings</Text>
              <Text style={styles.textXsOpacity}>
                This will reset all settings to their default values
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleResetSettings}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Backup Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup Settings</Text>
        <View style={styles.card}>
          <SettingsItem
            title="Auto Backup"
            description="Automatically backup new photos and videos"
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
            description="Only backup when connected to Wi-Fi"
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
            title="Charging Only"
            description="Only backup when device is charging"
            icon="battery-charging-outline"
            iconColor="#f1c40f"
          >
            <Switch
              value={settings.chargingOnlyBackup}
              onValueChange={handleChargingOnlyToggle}
              trackColor={{ false: '#95a5a6', true: '#f1c40f' }}
              thumbColor="white"
            />
          </SettingsItem>
        </View>
      </View>
      
      {/* Quality Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality Settings</Text>
        <View style={styles.card}>
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
        </View>
      </View>
      
      {/* Storage Limit Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Limit</Text>
        <View style={styles.card}>
          <View style={styles.flexRowBetween}>
            <Text style={styles.fontMedium}>Storage Limit</Text>
            <Text style={styles.textSmOpacity}>{localStorageLimit}%</Text>
          </View>
          <Slider
            minimumValue={10}
            maximumValue={99}
            step={5}
            value={localStorageLimit}
            onValueChange={handleStorageLimitChange}
            onSlidingComplete={handleStorageLimitComplete}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#3498db"
            style={{ height: 40 }}
          />
          <Text style={styles.textXsOpacity}>
            Stop backing up when server storage usage exceeds this percentage
          </Text>
        </View>
      </View>
      
      {/* Background Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Activity</Text>
        <View style={styles.card}>
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
          
          <View style={styles.py2}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.fontMedium}>Refresh Interval</Text>
              <Text style={styles.textSmOpacity}>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.flexRowBetween}>
            <View>
              <Text style={styles.fontMedium}>iClood</Text>
              <Text style={styles.textXsOpacity}>Version 1.0.0</Text>
              <Text style={styles.textXsOpacity}>
                Device: {Device.modelName} ({Platform.OS} {Platform.Version})
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleResetSettings}
            >
              <Text style={styles.buttonText}>Reset All Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  textSuccess: {
    color: '#10B981',
  },
  textError: {
    color: '#EF4444',
  },
  py2: {
    paddingVertical: 8,
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fontMedium: {
    fontWeight: '500',
    color: '#1F2937',
  },
  textSmOpacity: {
    fontSize: 14,
    color: 'rgba(31, 41, 55, 0.6)',
  },
  textXsOpacity: {
    fontSize: 12,
    color: 'rgba(31, 41, 55, 0.6)',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
});

export default SettingsScreen; 