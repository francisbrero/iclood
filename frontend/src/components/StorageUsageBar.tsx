import React from 'react';
import { View, Text } from 'react-native';

interface StorageUsageBarProps {
  totalSpace: number;
  usedSpace: number;
  iCloodSpace: number;
  warningThreshold: number;
}

const StorageUsageBar: React.FC<StorageUsageBarProps> = ({
  totalSpace,
  usedSpace,
  iCloodSpace,
  warningThreshold
}) => {
  // Calculate percentages
  const usedPercent = (usedSpace / totalSpace) * 100;
  const iCloodPercent = (iCloodSpace / totalSpace) * 100;
  const otherPercent = usedPercent - iCloodPercent;
  
  // Determine warning level
  const isWarning = usedPercent >= warningThreshold;
  const isCritical = usedPercent >= 90;
  
  return (
    <View>
      {/* Usage bar */}
      <View className="h-4 bg-gray-100 rounded-full overflow-hidden">
        {/* iClood usage */}
        <View 
          className="absolute h-full bg-primary rounded-l-full"
          style={{ width: `${iCloodPercent}%` }}
        />
        
        {/* Other usage */}
        <View 
          className="absolute h-full bg-gray-400"
          style={{ 
            width: `${otherPercent}%`, 
            left: `${iCloodPercent}%` 
          }}
        />
      </View>
      
      {/* Legend */}
      <View className="flex-row mt-2">
        <View className="flex-row items-center mr-4">
          <View className="w-3 h-3 rounded-full bg-primary mr-1" />
          <Text className="text-xs text-text/60">iClood</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-gray-400 mr-1" />
          <Text className="text-xs text-text/60">Other</Text>
        </View>
        
        {isWarning && (
          <View className="flex-row items-center ml-auto">
            <View className={`w-3 h-3 rounded-full mr-1 ${isCritical ? 'bg-error' : 'bg-warning'}`} />
            <Text className={`text-xs ${isCritical ? 'text-error' : 'text-warning'}`}>
              {isCritical ? 'Critical' : 'Warning'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StorageUsageBar; 