import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StorageScreen from './src/screens/StorageScreen';
import ServerSetupScreen from './src/screens/ServerSetupScreen';

// Context
import { SettingsProvider } from './src/context/SettingsContext';
import { BackupProvider } from './src/context/BackupContext';

// Define types for the navigation
type RootStackParamList = {
  Main: undefined;
  ServerSetup: undefined;
};

type TabParamList = {
  Home: undefined;
  Storage: undefined;
  Settings: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Storage') {
            iconName = focused ? 'cloud-done' : 'cloud-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // You can return any component here
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f5f7fa',
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'iClood Backup' }}
      />
      <Tab.Screen 
        name="Storage" 
        component={StorageScreen} 
        options={{ title: 'Storage' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();
    
    // Set up weekly backup notification
    scheduleWeeklyBackupNotification();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SettingsProvider>
        <BackupProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="ServerSetup" 
                component={ServerSetupScreen}
                options={{
                  headerShown: true,
                  title: 'Server Setup',
                  presentation: 'modal',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </BackupProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

// Helper functions for notifications
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for notification!');
    return;
  }
}

async function scheduleWeeklyBackupNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Schedule weekly notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for an iClood Backup!',
      body: 'Tap to back up your photos and videos to your home server.',
      sound: true,
    },
    trigger: {
      weekday: 6, // Saturday
      hour: 12,
      minute: 0,
      repeats: true,
    },
  });
} 