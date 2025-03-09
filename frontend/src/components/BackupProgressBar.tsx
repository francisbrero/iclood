import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackupProgressBarProps {
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  percentage: number;
  onCancel: () => void;
}

const BackupProgressBar: React.FC<BackupProgressBarProps> = ({
  currentFile,
  totalFiles,
  currentFileName,
  percentage,
  onCancel
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-upload-outline" size={20} color="#0066FF" />
          </View>
          <View>
            <Text style={styles.title}>Backing up...</Text>
            <Text style={styles.subtitle}>
              {currentFile} of {totalFiles} files
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
        {currentFileName}
      </Text>
      
      <View style={styles.progressBackground}>
        <View 
          style={[styles.progressBar, { width: `${percentage}%` }]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    padding: 24,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066FF',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 4,
  },
});

export default BackupProgressBar; 