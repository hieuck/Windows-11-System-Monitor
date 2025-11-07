import React from 'react';
import NetworkMonitor from './components/NetworkMonitor';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?blur=5')"}}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/80 backdrop-blur-md flex items-center px-4">
            <p className="text-white text-sm">Simulated Windows 11 Taskbar</p>
        </div>
        <NetworkMonitor />
        <div className="absolute top-4 right-4 text-white bg-slate-800/50 p-3 rounded-lg backdrop-blur-sm shadow-lg text-sm max-w-sm">
            <h1 className="font-bold text-lg mb-2">Windows 11 System Monitor</h1>
            <p className="text-slate-300">
              Đây là một ứng dụng mô phỏng. Kéo thả widget để di chuyển.
              <br />
              Nhấp vào bánh răng để tùy chỉnh. Bảng cài đặt sẽ mở rộng thông minh. Bạn có thể chọn ổ đĩa muốn theo dõi và kiểm tra phiên bản mới nhất.
            </p>
        </div>
    </div>
  );
};

export default App;