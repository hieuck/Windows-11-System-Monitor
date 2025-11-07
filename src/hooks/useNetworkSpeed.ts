import { useState, useEffect } from 'react';

const MOCK_APPS = [
    'chrome.exe',
    'steam.exe',
    'Spotify.exe',
    'svchost.exe',
    'Discord.exe',
    'msedge.exe',
    'CreativeCloud.exe'
];

const useNetworkSpeed = (interval: number = 2000) => {
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [activeApp, setActiveApp] = useState(MOCK_APPS[0]);
  
  useEffect(() => {
    let appUpdateCounter = 0;
    const simulateSpeed = () => {
      // Simulate download speed (e.g., up to 100 MB/s)
      const newDownloadSpeed = Math.random() * 100 * 1024 * 1024;
      // Simulate upload speed (e.g., up to 20 MB/s)
      const newUploadSpeed = Math.random() * 20 * 1024 * 1024;

      setDownloadSpeed(newDownloadSpeed);
      setUploadSpeed(newUploadSpeed);

      // Change app every 3 ticks (3 * interval)
      appUpdateCounter++;
      if (appUpdateCounter > 2) {
          appUpdateCounter = 0;
          const highUsage = newDownloadSpeed > (40 * 1024 * 1024) || newUploadSpeed > (5 * 1024 * 1024);
          if (highUsage) {
            // Filter out system process for high usage
            const userApps = MOCK_APPS.filter(app => app !== 'svchost.exe');
            setActiveApp(userApps[Math.floor(Math.random() * userApps.length)]);
          } else {
            setActiveApp('svchost.exe'); // Simulate idle background process
          }
      }
    };

    simulateSpeed(); // Initial call
    const timer = setInterval(simulateSpeed, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { downloadSpeed, uploadSpeed, activeApp };
};

export default useNetworkSpeed;