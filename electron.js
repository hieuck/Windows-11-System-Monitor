const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Tạo cửa sổ trình duyệt.
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      // Các thiết lập này cần thiết để ứng dụng web có thể hoạt động bên trong Electron
      nodeIntegration: true,
      contextIsolation: false,
    },
    // Thêm icon cho ứng dụng của bạn (tùy chọn)
    // icon: path.join(__dirname, 'build/favicon.ico') 
  });

  // Tải file index.html của ứng dụng React sau khi đã được build.
  const startPath = path.join(__dirname, 'build/index.html');
  win.loadFile(startPath);
  
  // Xóa menu bar mặc định (File, Edit, etc.) để ứng dụng trông gọn gàng hơn
  win.setMenu(null);
}

// Phương thức này sẽ được gọi khi Electron đã sẵn sàng.
app.whenReady().then(createWindow);

// Thoát ứng dụng khi tất cả cửa sổ đã đóng.
app.on('window-all-closed', () => {
  // Trên macOS, ứng dụng thường không thoát hoàn toàn.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Trên macOS, tạo lại cửa sổ khi click vào icon trên dock.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
