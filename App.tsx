import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import StorageScreen from './src/screens/StorageScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Contexts
import { SettingsProvider } from './src/context/SettingsContext';
import { BackupProvider } from './src/context/BackupContext';

const Tab = createBottomTabNavigator();

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

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#64748B',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#F8FAFC',
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

function App() {
  return (
    <NavigationContainer>
      <SettingsProvider>
        <BackupProvider>
          <MainTabs />
        </BackupProvider>
      </SettingsProvider>
    </NavigationContainer>
  );
}

export default styled(App); 