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
  Keyboard,
  StyleSheet
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
      Alert.alert('Error', 'Please enter a server address');
      return;
    }
    
    // Allow URLs, hostnames, and IP addresses
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+)(:\d+)?$/;
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!urlPattern.test(serverIP) && !ipPattern.test(serverIP)) {
      Alert.alert('Error', 'Please enter a valid server address (e.g., 192.168.1.10, example.com, or http://example.com)');
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
          'Could not connect to the server. Please check the address, port, and make sure your server is running.',
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Network Status */}
          {!isWifiConnected && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Not connected to Wi-Fi. Connect to your home network to set up the server.
              </Text>
            </View>
          )}
          
          {/* Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Server Setup</Text>
            <Text style={styles.cardDescription}>
              Configure your server's address and port to enable secure photo backup.
            </Text>

            <View style={styles.ipBox}>
              <Ionicons name="information-circle" size={20} color="#3498db" />
              <Text style={styles.ipBoxText}>
                Enter your server's IP address, hostname, or URL.
              </Text>
            </View>
          </View>
          
          {/* Server Settings */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Server Address</Text>
            <TextInput
              style={styles.input}
              value={serverIP}
              onChangeText={setServerIP}
              placeholder="e.g. 192.168.1.100 or example.com"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            {/* IP Suggestions */}
            {ipAddresses.length > 0 && (
              <View style={styles.ipSuggestions}>
                <Text style={styles.ipSuggestionsLabel}>Suggested IP prefixes:</Text>
                {ipAddresses.map((ip, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.ipSuggestionButton}
                    onPress={() => handleSuggestedIPPress(ip)}
                  >
                    <Text style={styles.ipSuggestionText}>{ip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Text style={styles.inputLabel}>Port</Text>
            <TextInput
              style={styles.input}
              value={serverPort}
              onChangeText={setServerPort}
              placeholder="e.g. 3000"
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              The default port is 3000. Only change this if you've configured your server to use a different port.
            </Text>
            
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="save-outline" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Help Text */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Need Help?</Text>
            <Text style={styles.helpText}>
              To find your Raspberry Pi's IP address, follow these steps:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                1. On your Raspberry Pi, run: <Text style={styles.codeCommand}>hostname -I</Text>{'\n'}
                2. The first IP address shown is your server's IP
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  warningBox: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#f39c12',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDescription: {
    color: 'rgba(44, 62, 80, 0.7)',
    marginBottom: 16,
  },
  ipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  ipBoxText: {
    color: 'rgba(44, 62, 80, 0.7)',
    marginLeft: 8,
  },
  inputLabel: {
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  ipSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  ipSuggestionsLabel: {
    fontSize: 12,
    color: 'rgba(44, 62, 80, 0.6)',
    width: '100%',
    marginBottom: 8,
  },
  ipSuggestionButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  ipSuggestionText: {
    color: '#3498db',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(44, 62, 80, 0.6)',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  helpText: {
    color: 'rgba(44, 62, 80, 0.7)',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: 'rgba(44, 62, 80, 0.7)',
  },
  codeCommand: {
    color: '#3498db',
  },
});

export default ServerSetupScreen; 