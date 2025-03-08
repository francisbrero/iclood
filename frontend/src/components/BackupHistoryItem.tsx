import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Helpers
import { formatDateTime, formatFileSize } from '../utils/formatting';

interface BackupHistoryItemProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  timestamp: Date;
  isLast?: boolean;
}

const BackupHistoryItem: React.FC<BackupHistoryItemProps> = ({
  fileName,
  fileSize,
  fileType,
  timestamp,
  isLast = false
}) => {
  const isVideo = fileType === 'video';
  const iconName = isVideo ? 'videocam' : 'image';
  const iconColor = isVideo ? '#9b59b6' : '#3498db';
  
  return (
    <View className={`py-3 ${isLast ? '' : 'border-b border-gray-100'}`}>
      <View className="flex-row items-center">
        <View 
          className="w-8 h-8 rounded-full justify-center items-center mr-3"
          style={{ backgroundColor: `${iconColor}10` }}
        >
          <Ionicons name={iconName} size={16} color={iconColor} />
        </View>
        
        <View className="flex-1">
          <Text className="font-medium text-text" numberOfLines={1} ellipsizeMode="middle">
            {fileName}
          </Text>
          
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-text/60">
              {formatFileSize(fileSize)} • {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
            </Text>
            <Text className="text-xs text-text/60">
              {formatDateTime(timestamp)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BackupHistoryItem; 