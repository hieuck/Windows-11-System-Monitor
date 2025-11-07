export const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(1)} B/s`;
  }
  
  const kilobytesPerSecond = bytesPerSecond / 1024;
  if (kilobytesPerSecond < 1024) {
    return `${kilobytesPerSecond.toFixed(1)} KB/s`;
  }

  const megabytesPerSecond = kilobytesPerSecond / 1024;
  if (megabytesPerSecond < 1024) {
    return `${megabytesPerSecond.toFixed(1)} MB/s`;
  }
  
  const gigabytesPerSecond = megabytesPerSecond / 1024;
  return `${gigabytesPerSecond.toFixed(1)} GB/s`;
};