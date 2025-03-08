import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  children: ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  children
}) => {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
      <View className="flex-row items-center flex-1 mr-4">
        <View 
          className="w-8 h-8 rounded-full justify-center items-center mr-3"
          style={{ backgroundColor: `${iconColor}10` }}
        >
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-text">{title}</Text>
          <Text className="text-xs text-text/60 mt-1">{description}</Text>
        </View>
      </View>
      <View>
        {children}
      </View>
    </View>
  );
};

export default SettingsItem; 