import { useState, useEffect } from 'react';

interface Disk {
    id: string;
    name: string;
    activity: number;
    temp: number;
}

const useHardwareStats = (interval: number = 2000) => {
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState({ used: 0, total: 16.0 });
  const [gpu, setGpu] = useState(0);
  const [disks, setDisks] = useState<Disk[]>([
      { id: 'ssd', name: 'SSD', activity: 0, temp: 0 },
      { id: 'hdd', name: 'HDD', activity: 0, temp: 0 },
      { id: 'nvme', name: 'NVME', activity: 0, temp: 0 }
  ]);
  const [cpuClock, setCpuClock] = useState(0);

  // Temps
  const [cpuTemp, setCpuTemp] = useState(0);
  const [gpuTemp, setGpuTemp] = useState(0);
  const [mbdTemp, setMbdTemp] = useState(0); // Motherboard
  
  useEffect(() => {
    const simulateStats = () => {
      // Simulate CPU usage (0-100%)
      setCpu(Math.random() * 100);
      
      // Simulate CPU Clock Speed (3.5 - 5.0 GHz)
      setCpuClock(3.5 + Math.random() * 1.5);

      // Simulate Memory usage
      setMemory(prev => ({ ...prev, used: Math.random() * prev.total }));

      // Simulate GPU usage (0-100%)
      setGpu(Math.random() * 100);

      // Simulate Disk activity and temps (0-100%)
      setDisks(prevDisks => prevDisks.map(disk => ({
          ...disk,
          activity: Math.random() * 100,
          temp: 30 + Math.random() * 25 // 30-55 °C
      })));

      // Simulate Temperatures
      setCpuTemp(45 + Math.random() * 50); // 45-95 °C
      setGpuTemp(40 + Math.random() * 50); // 40-90 °C
      setMbdTemp(30 + Math.random() * 20); // 30-50 °C
    };

    simulateStats(); // Initial call
    const timer = setInterval(simulateStats, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { cpu, memory, gpu, disks, cpuClock, cpuTemp, gpuTemp, mbdTemp };
};

export default useHardwareStats;