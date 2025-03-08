import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ServerSetup: undefined;
};

type NoServerConnectionNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NoServerConnection: React.FC = () => {
  const navigation = useNavigation<NoServerConnectionNavigationProp>();
  
  const handleSetupPress = () => {
    navigation.navigate('ServerSetup');
  };
  
  return (
    <View className="bg-card rounded-lg p-6 shadow-sm my-4 items-center">
      <Ionicons name="server-outline" size={64} color="#95a5a6" />
      
      <Text className="text-lg font-semibold text-text mt-4 text-center">
        No Server Connection
      </Text>
      
      <Text className="text-text/70 text-center mt-2">
        You need to connect to your iClood server to back up your photos and videos.
      </Text>
      
      <TouchableOpacity
        className="bg-primary mt-6 py-3 px-6 rounded-full"
        onPress={handleSetupPress}
      >
        <Text className="text-white font-semibold">Set Up Server</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoServerConnection; 