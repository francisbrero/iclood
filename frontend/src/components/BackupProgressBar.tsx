import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackupProgressBarProps {
  progress: number;
  fileName: string;
  currentFile: number;
  totalFiles: number;
  onCancel: () => void;
}

const BackupProgressBar: React.FC<BackupProgressBarProps> = ({
  progress,
  fileName,
  currentFile,
  totalFiles,
  onCancel
}) => {
  return (
    <View className="bg-primary/10 p-4 rounded-lg mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-semibold text-primary">Backing up...</Text>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close-circle" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      
      <Text className="text-text text-sm mb-1" numberOfLines={1} ellipsizeMode="middle">
        {fileName}
      </Text>
      
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <View 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </View>
      
      <View className="flex-row justify-between">
        <Text className="text-xs text-text/60">
          {currentFile} of {totalFiles}
        </Text>
        <Text className="text-xs text-text/60">
          {progress}%
        </Text>
      </View>
    </View>
  );
};

export default BackupProgressBar; 