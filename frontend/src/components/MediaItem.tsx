import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

interface MediaItemProps {
  asset: {
    id: string;
    uri: string;
    mediaType: 'photo' | 'video';
    duration?: number;
    ignored?: boolean;
  };
  isSelected: boolean;
  onToggleSelection: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ asset, isSelected, onToggleSelection }) => {
  const isVideo = asset.mediaType === 'video';
  const [imageError, setImageError] = useState(false);
  const [imageUri, setImageUri] = useState(asset.uri);

  // Handle iOS photo URLs
  React.useEffect(() => {
    const loadProperUri = async () => {
      if (Platform.OS === 'ios' && asset.uri.startsWith('ph://')) {
        try {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          if (assetInfo.localUri) {
            setImageUri(assetInfo.localUri);
          }
        } catch (error) {
          console.error('Error getting local URI:', error);
          setImageError(true);
        }
      }
    };

    loadProperUri();
  }, [asset.uri, asset.id]);
  
  return (
    <TouchableOpacity 
      style={[styles.container, asset.ignored && styles.ignoredContainer]}
      onPress={onToggleSelection}
      activeOpacity={0.7}
    >
      {imageError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="image" size={32} color="#64748B" />
        </View>
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, asset.ignored && styles.ignoredImage]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* Selection indicator */}
      <View style={[styles.selectionIndicator, isSelected ? styles.selectedIndicator : styles.unselectedIndicator]}>
        {isSelected ? (
          <Ionicons name="checkmark" size={16} color="white" />
        ) : (
          <Ionicons name={asset.ignored ? "eye-off" : "add"} size={16} color="white" />
        )}
      </View>
      
      {/* Video indicator */}
      {isVideo && (
        <View style={styles.videoIndicator}>
          <Ionicons name="videocam" size={14} color="white" />
          {asset.duration && (
            <Text style={styles.duration}>
              {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: '#0066FF',
  },
  unselectedIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  duration: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  ignoredContainer: {
    opacity: 0.7,
  },
  ignoredImage: {
    opacity: 0.7,
  },
});

export default MediaItem; 