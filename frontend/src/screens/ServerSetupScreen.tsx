import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Network from 'expo-network';

// Contexts
import { useSettings } from '../context/SettingsContext';

const ServerSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateSettings, checkServerConnection, isServerReachable } = useSettings();
  
  const [serverIP, setServerIP] = useState(settings.serverIP);
  const [serverPort, setServerPort] = useState(settings.serverPort);
  const [isLoading, setIsLoading] = useState(false);
  const [isWifiConnected, setIsWifiConnected] = useState(false);
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  
  // Check if we're on Wi-Fi and suggest local IPs on mount
  useEffect(() => {
    checkNetworkAndSuggestIPs();
  }, []);
  
  // Check network and suggest local IPs
  const checkNetworkAndSuggestIPs = async () => {
    try {
      // Check if we're on Wi-Fi
      const networkState = await Network.getNetworkStateAsync();
      setIsWifiConnected(networkState.type === Network.NetworkStateType.WIFI);
      
      if (networkState.type === Network.NetworkStateType.WIFI) {
        // Suggest common local IPs
        const suggestedIPs = ['192.168.1.', '192.168.0.', '10.0.0.'];
        setIpAddresses(suggestedIPs);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };
  
  // Try to connect to server
  const handleConnect = async () => {
    Keyboard.dismiss();
    
    if (!serverIP) {
      Alert.alert('Error', 'Please enter a server IP address');
      return;
    }
    
    // Validate IP format
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(serverIP)) {
      Alert.alert('Error', 'Please enter a valid IP address (e.g., 192.168.1.10)');
      return;
    }
    
    // Validate port
    const portNum = parseInt(serverPort);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      Alert.alert('Error', 'Please enter a valid port number (1-65535)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update settings first
      await updateSettings({
        serverIP,
        serverPort
      });
      
      // Try to connect
      const isConnected = await checkServerConnection();
      
      if (isConnected) {
        Alert.alert(
          'Connection Successful',
          'Successfully connected to your iClood server.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the server. Please check the IP address, port, and make sure your server is running and you are on the same network.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'An error occurred while trying to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use suggested IP prefix
  const handleSuggestedIPPress = (prefix: string) => {
    setServerIP(prefix);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Network Status */}
          {!isWifiConnected && (
            <View className="bg-warning/20 p-4 rounded-lg mb-4">
              <Text className="text-warning font-semibold">
                Not connected to Wi-Fi. Connect to your home network to set up the server.
              </Text>
            </View>
          )}
          
          {/* Info Card */}
          <View className="bg-card rounded-lg p-4 shadow-sm mb-6">
            <Text className="text-lg font-semibold text-text mb-2">Server Setup</Text>
            <Text className="text-text/70 mb-4">
              Enter the IP address and port of your iClood server. This should be the Raspberry Pi running
              on your home network.
            </Text>
            
            <View className="flex-row items-center bg-primary/5 p-2 rounded-lg mb-4">
              <Ionicons name="information-circle" size={20} color="#3498db" />
              <Text className="text-text/70 ml-2">
                Make sure your server is running and you're connected to the same Wi-Fi network.
              </Text>
            </View>
          </View>
          
          {/* Server Settings */}
          <View className="bg-card rounded-lg p-4 shadow-sm mb-6">
            <Text className="font-medium text-text mb-2">Server IP Address</Text>
            <TextInput
              className="bg-background p-3 rounded-lg border border-gray-200 mb-4"
              placeholder="192.168.1.10"
              value={serverIP}
              onChangeText={setServerIP}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              editable={!isLoading}
            />
            
            {/* IP Suggestions */}
            {ipAddresses.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                <Text className="text-xs text-text/60 w-full mb-2">Suggested IP prefixes:</Text>
                {ipAddresses.map((ip, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-primary/10 mr-2 mb-2 py-1 px-2 rounded"
                    onPress={() => handleSuggestedIPPress(ip)}
                  >
                    <Text className="text-primary text-sm">{ip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Text className="font-medium text-text mb-2">Port</Text>
            <TextInput
              className="bg-background p-3 rounded-lg border border-gray-200 mb-2"
              placeholder="8080"
              value={serverPort}
              onChangeText={setServerPort}
              keyboardType="number-pad"
              editable={!isLoading}
            />
            <Text className="text-xs text-text/60 mb-4">
              The default port is 8080 unless you changed it in your server configuration.
            </Text>
            
            <TouchableOpacity
              className="bg-primary p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="link" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Connect to Server
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Help Text */}
          <View className="bg-card rounded-lg p-4 shadow-sm mb-6">
            <Text className="font-medium text-text mb-2">Need Help?</Text>
            <Text className="text-text/70 mb-2">
              The IP address of your Raspberry Pi can typically be found by:
            </Text>
            <View className="bg-background p-3 rounded-lg">
              <Text className="font-mono text-xs text-text/70">
                1. On your Raspberry Pi, run: <Text className="text-primary">hostname -I</Text>{'\n'}
                2. Check your router's connected devices list{'\n'}
                3. Use a network scanner app on your phone
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ServerSetupScreen; 