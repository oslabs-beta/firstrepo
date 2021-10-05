import { BrowserWindow, app } from 'electron';

import { fork } from 'child_process';
import * as path from 'path';

//so we need to compile down from ts to js upon loading app -> adding that to package.json
function createWindow() {
  //this compiles but feels janky, how to create browserwindow as a class??
  //can do this with import which automatically transpiles down to a require statement which is sooooooo nice
  const win: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile('../../index.html');
}
app.whenReady().then(() => {
  createWindow();

  const serverProcess = fork(path.resolve(__dirname, '../server/server.js'));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  //closes process if window closed and not on MacOS (keeps in dock for Mac though, as expected for Mac UX)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});
