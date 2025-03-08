/**
 * Format file size to human readable format
 * @param bytes Size in bytes
 * @returns Formatted string (e.g. "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format date to readable string
 * @param date Date object
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(undefined, options);
};

/**
 * Format time to readable string
 * @param date Date object
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  
  return date.toLocaleTimeString(undefined, options);
};

/**
 * Format date and time to readable string
 * @param date Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
}; 