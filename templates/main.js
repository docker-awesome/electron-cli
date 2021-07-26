const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'logo.png'));
  }

  win.loadFile('<%= path %>/index.html');
}

app.whenReady().then(() => {
  createWindow();
  /* dialog.showMessageBox({
    title: 'title',
    message: 'message',
    type: 'error',
    detail: 'detail',
    icon: path.join(__dirname, 'logo.png')
  }); */

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
