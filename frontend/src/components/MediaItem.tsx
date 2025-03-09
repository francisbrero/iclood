import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
import { MediaAsset } from '../context/BackupContext';

interface MediaItemProps {
  asset: {
    id: string;
    uri: string;
    mediaType: 'photo' | 'video';
    duration?: number;
  };
  isSelected: boolean;
  onToggleSelection: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ asset, isSelected, onToggleSelection }) => {
  const isVideo = asset.mediaType === 'video';
  
  return (
    <TouchableOpacity 
      className="relative flex-1 m-1 aspect-square"
      onPress={onToggleSelection}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: asset.uri }}
        className="w-full h-full rounded-2xl"
        resizeMode="cover"
      />
      
      {/* Selection indicator */}
      <View 
        className={`absolute top-2 right-2 w-8 h-8 rounded-full justify-center items-center ${
          isSelected ? 'bg-primary' : 'bg-black/50'
        }`}
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={16} color="white" />
        ) : (
          <Ionicons name="add" size={16} color="white" />
        )}
      </View>
      
      {/* Video indicator */}
      {isVideo && (
        <View className="absolute bottom-2 left-2 flex-row items-center bg-black/50 px-2 py-1 rounded-full">
          <Ionicons name="videocam" size={14} color="white" />
          {asset.duration && (
            <Text className="text-white text-xs ml-1">
              {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default MediaItem; 