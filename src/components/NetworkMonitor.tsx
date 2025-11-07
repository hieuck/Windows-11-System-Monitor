import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import useNetworkSpeed from '../hooks/useNetworkSpeed';
import useHardwareStats from '../hooks/useHardwareStats';
import { formatSpeed } from '../utils/formatSpeed';
import { 
    DownloadIcon, UploadIcon, SettingsIcon, AppWindowIcon,
    CpuIcon, MemoryIcon, GpuIcon, DiskIcon, TemperatureIcon, DragHandleIcon,
    ClockIcon, MotherboardIcon, UpdateIcon
} from './icons';

interface Position {
  x: number;
  y: number;
}

interface Metric {
    id: string;
    label: string; 
    fullLabel: string;
    visible: boolean;
    icon: React.FC<{className?: string}>;
    getValue: () => string;
}

const NetworkMonitor: React.FC = () => {
  const { downloadSpeed, uploadSpeed, activeApp } = useNetworkSpeed(1500);
  const { cpu, memory, gpu, disks, cpuTemp, gpuTemp, mbdTemp, cpuClock } = useHardwareStats(1500);
  
  const [position, setPosition] = useState<Position>({ x: 100, y: window.innerHeight - 550 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal');
  const [selectedDiskId, setSelectedDiskId] = useState<string>(disks[0]?.id || 'ssd');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  
  const [draggedMetricId, setDraggedMetricId] = useState<string | null>(null);

  const selectedDisk = disks.find(d => d.id === selectedDiskId) || disks[0];

  const [metrics, setMetrics] = useState<Metric[]>(() => [
    { id: 'cpuClock', label: 'Clock', fullLabel: 'Xung CPU', visible: true, icon: ClockIcon, getValue: () => `0.00 GHz` },
    { id: 'upload', label: 'Tải lên', fullLabel: 'Tải lên', visible: true, icon: UploadIcon, getValue: () => `0.0 KB/s` },
    { id: 'cpu', label: 'CPU', fullLabel: '%CPU', visible: true, icon: CpuIcon, getValue: () => `0%` },
    { id: 'memory', label: 'MEM', fullLabel: '%RAM', visible: true, icon: MemoryIcon, getValue: () => `0%` },
    { id: 'gpu', label: 'GPU', fullLabel: '%GPU', visible: true, icon: GpuIcon, getValue: () => `0%` },
    { id: 'disk', label: 'SSD', fullLabel: '%DISK', visible: true, icon: DiskIcon, getValue: () => `0%` },
    { id: 'download', label: 'Tải xuống', fullLabel: 'Tải xuống', visible: true, icon: DownloadIcon, getValue: () => `0.0 KB/s` },
    { id: 'cpuTemp', label: 'CPU', fullLabel: 'CPU Temp', visible: true, icon: TemperatureIcon, getValue: () => `0°C` },
    { id: 'mbdTemp', label: 'MBD', fullLabel: 'MBD Temp', visible: true, icon: MotherboardIcon, getValue: () => `0°C` },
    { id: 'gpuTemp', label: 'GPU', fullLabel: 'GPU Temp', visible: true, icon: TemperatureIcon, getValue: () => `0°C` },
    { id: 'diskTemp', label: 'SSD', fullLabel: 'Disk Temp', visible: true, icon: TemperatureIcon, getValue: () => `0°C` },
  ]);

  useEffect(() => {
      setMetrics(prevMetrics => prevMetrics.map(metric => {
          switch (metric.id) {
              case 'cpuClock':
                  return { ...metric, getValue: () => `${cpuClock.toFixed(2)} GHz` };
              case 'upload':
                  return { ...metric, getValue: () => formatSpeed(uploadSpeed) };
              case 'cpu':
                  return { ...metric, getValue: () => `${cpu.toFixed(0)}%` };
              case 'memory':
                  return { ...metric, getValue: () => `${((memory.used / memory.total) * 100).toFixed(0)}%` };
              case 'gpu':
                  return { ...metric, getValue: () => `${gpu.toFixed(0)}%` };
              case 'disk':
                  return { ...metric, label: selectedDisk.name, getValue: () => `${selectedDisk.activity.toFixed(0)}%` };
              case 'download':
                  return { ...metric, getValue: () => formatSpeed(downloadSpeed) };
              case 'cpuTemp':
                  return { ...metric, getValue: () => `${cpuTemp.toFixed(0)}°C` };
              case 'mbdTemp':
                  return { ...metric, getValue: () => `${mbdTemp.toFixed(0)}°C` };
              case 'gpuTemp':
                  return { ...metric, getValue: () => `${gpuTemp.toFixed(0)}°C` };
              case 'diskTemp':
                  return { ...metric, label: selectedDisk.name, getValue: () => `${selectedDisk.temp.toFixed(0)}°C` };
              default:
                  return metric;
          }
      }));
  }, [cpu, memory, gpu, disks, selectedDisk, cpuTemp, gpuTemp, mbdTemp, cpuClock, uploadSpeed, downloadSpeed]);


  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.settings-panel') || (e.target as HTMLElement).closest('button')) {
        return;
    }

    if (dragRef.current) {
      setIsDragging(true);
      const rect = dragRef.current.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const handleToggleMetric = (id: string) => {
    setMetrics(prev => prev.map(m => m.id === id ? {...m, visible: !m.visible} : m));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedMetricId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedMetricId || draggedMetricId === targetId) return;

    const newMetrics = [...metrics];
    const draggedIndex = newMetrics.findIndex(m => m.id === draggedMetricId);
    const targetIndex = newMetrics.findIndex(m => m.id === targetId);

    const [draggedItem] = newMetrics.splice(draggedIndex, 1);
    newMetrics.splice(targetIndex, 0, draggedItem);
    
    setMetrics(newMetrics);
    setDraggedMetricId(null);
  };
  
  const handleUpdateCheck = () => {
    setUpdateStatus('Đang kiểm tra...');
    setTimeout(() => {
        setUpdateStatus('Bạn đang dùng phiên bản mới nhất.');
        setTimeout(() => setUpdateStatus(''), 3000);
    }, 1500);
  };

  const cpuClockMetric = metrics.find(m => m.id === 'cpuClock');
  const otherMetrics = metrics.filter(m => m.id !== 'cpuClock');
  const visibleOtherMetrics = otherMetrics.filter(m => m.visible);
  
  const [settingsStyle, setSettingsStyle] = useState<React.CSSProperties>({});
  
  useLayoutEffect(() => {
    if (showSettings && dragRef.current) {
        const widgetRect = dragRef.current.getBoundingClientRect();
        const newSettingsStyle: React.CSSProperties = { position: 'absolute' };
        
        const settingsWidth = layout === 'horizontal' ? 520 : 224; // 32.5rem vs 14rem
        const settingsHeight = layout === 'horizontal' ? 240 : 330; 

        if (layout === 'vertical') {
            const spaceOnRight = window.innerWidth - widgetRect.right;
            if (spaceOnRight > settingsWidth + 16) { 
                newSettingsStyle.left = '100%';
                newSettingsStyle.marginLeft = '8px';
            } else {
                newSettingsStyle.right = '100%';
                newSettingsStyle.marginRight = '8px';
            }
            newSettingsStyle.top = '0';
        } else { // Horizontal
            const spaceBelow = window.innerHeight - widgetRect.bottom;
            if (spaceBelow > settingsHeight + 48) { 
                newSettingsStyle.top = '100%';
                newSettingsStyle.marginTop = '8px';
            } else {
                newSettingsStyle.bottom = '100%';
                newSettingsStyle.marginBottom = '8px';
            }
            newSettingsStyle.left = '0';
        }
        setSettingsStyle(newSettingsStyle);
    }
  }, [showSettings, position, layout]);


  return (
    <div
      ref={dragRef}
      className="absolute bg-slate-800/70 backdrop-blur-lg border border-slate-600/50 rounded-lg shadow-2xl cursor-move select-none transition-all duration-300"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative p-2" style={{ width: layout === 'horizontal' ? '34rem' : '13rem' }}>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-300 pl-1">SYSTEM MONITOR</h2>
            <button onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-white transition-colors z-20">
            <SettingsIcon className="w-4 h-4" />
            </button>
        </div>

        {cpuClockMetric && cpuClockMetric.visible && (
            <div className="border-b border-slate-700/50 mb-2 pb-2">
                <div className="flex items-center justify-between text-slate-200">
                    <div className="flex items-center space-x-2">
                        <cpuClockMetric.icon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium">{cpuClockMetric.label}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-white">
                        {cpuClockMetric.getValue()}
                    </span>
                </div>
            </div>
        )}

        <div className={layout === 'vertical' ? 'flex flex-col space-y-1' : 'grid grid-cols-5 gap-x-2 gap-y-1'}>
            {visibleOtherMetrics.length > 0 ? (
            visibleOtherMetrics.map(metric => {
                const Icon = metric.icon;
                const isNetworkMetric = metric.id === 'upload' || metric.id === 'download';
                const showLabel = layout === 'vertical' || !isNetworkMetric;
                return (
                    <div key={metric.id} className="flex items-center justify-between text-slate-200 text-xs px-1">
                        <div className="flex items-center space-x-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        {showLabel && <span className="font-medium truncate">{metric.label}</span>}
                        </div>
                        <span className="font-mono font-semibold text-white ml-1">
                        {metric.getValue()}
                        </span>
                    </div>
                )
            })
            ) : (
                !cpuClockMetric?.visible && <p className="text-xs text-slate-400 text-center py-2 col-span-5">Bật một chỉ số trong cài đặt.</p>
            )}
        </div>

        {metrics.some(m => m.visible) && (
            <div className="border-t border-slate-700/50 mt-2 pt-2">
                <div className="flex items-center space-x-2 text-slate-400" title={activeApp}>
                    <AppWindowIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs truncate">{activeApp}</span>
                </div>
            </div>
        )}
     

      {showSettings && (
        <div 
          className={`settings-panel bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-2xl p-3 z-10 transition-all duration-300 ${layout === 'horizontal' ? 'w-[34rem]' : 'w-56'}`}
          style={settingsStyle}
        >
            <p className="text-xs text-slate-400 mb-2 px-1">Hiển thị & Sắp xếp</p>
            <div className={`max-h-48 overflow-y-auto pr-1 ${layout === 'horizontal' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}`}>
                {metrics.map(metric => (
                    <div 
                        key={metric.id}
                        className="flex items-center bg-slate-700/50 rounded p-1.5 justify-between text-xs text-slate-300"
                        draggable
                        onDragStart={(e) => handleDragStart(e, metric.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, metric.id)}
                    >
                        <div className="flex items-center space-x-2">
                           <DragHandleIcon className="w-4 h-4 text-slate-500 cursor-grab" />
                           <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={metric.visible} onChange={() => handleToggleMetric(metric.id)} className="accent-cyan-500" />
                                <span>{metric.fullLabel}</span>
                            </label>
                        </div>
                        <metric.icon className="w-4 h-4 text-slate-400" />
                    </div>
                ))}
            </div>
            <div className={`mt-4 ${layout === 'horizontal' ? 'grid grid-cols-2 gap-x-4 items-start' : ''}`}>
                 <div className="space-y-3">
                    <div className="px-1">
                        <p className="text-xs text-slate-400 mb-1">Bố cục</p>
                        <div className="flex items-center justify-between text-xs bg-slate-700/50 rounded p-1">
                            <button onClick={() => setLayout('vertical')} className={`px-3 py-1 rounded w-1/2 transition-colors ${layout === 'vertical' ? 'bg-cyan-500/50 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}>Dọc</button>
                            <button onClick={() => setLayout('horizontal')} className={`px-3 py-1 rounded w-1/2 transition-colors ${layout === 'horizontal' ? 'bg-cyan-500/50 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}>Ngang</button>
                        </div>
                    </div>
                    <div className="px-1">
                        <p className="text-xs text-slate-400 mb-1">Theo dõi Ổ đĩa</p>
                        <select 
                            value={selectedDiskId}
                            onChange={(e) => setSelectedDiskId(e.target.value)}
                            className="w-full bg-slate-700/50 text-xs text-slate-200 rounded p-1.5 border-0 focus:ring-1 focus:ring-cyan-500"
                        >
                            {disks.map(disk => <option key={disk.id} value={disk.id}>{disk.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className={`px-1 ${layout === 'vertical' ? 'mt-3' : ''}`}>
                     <button 
                        onClick={handleUpdateCheck}
                        className="w-full h-full flex items-center justify-center space-x-2 text-xs text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-md py-1.5 transition-colors"
                    >
                        <UpdateIcon className="w-4 h-4" />
                        <span>{updateStatus || 'Kiểm tra cập nhật'}</span>
                    </button>
                </div>
            </div>
        </div>
      )}
       </div>
    </div>
  );
};

export default NetworkMonitor;