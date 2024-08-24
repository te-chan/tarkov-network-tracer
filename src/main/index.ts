import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs';
import path from 'path';
import {exec } from 'child_process';

function createWindow(): BrowserWindow {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    const mainWindow = createWindow();

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    ipcMain.handle('tracert', async (_, ipAddress) => {
        return new Promise((resolve, reject) => {
            console.log(`Executing tracert for IP: ${ipAddress}`); // ロギング追加
            
            let output = ''; // 出力を結合するための変数
            let found: string[] = [];
            const tracertProcess = exec(`tracert ${ipAddress}`);
            
            if(!tracertProcess.stdout)
                return;

            tracertProcess.stdout.on('data', (data) => {
                output += data; // 出力を結合
                console.log(`tracert output: ${data}`); // リアルタイムで出力を表示
                // ここでリアルタイムに結果を送信
                mainWindow.webContents.send('tracert-output', data);
                
                // IPが見つかった場合、リアルタイムで送信
                const match = data.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (match) {
                    if(found.length == 0 && ipAddress === match[0])
                        return; // 最初のIPはデバッグででてきてるだけだから無視
                    
                    console.log(`Extracted IP address: ${match[0]}`); // リアルタイムでIPを表示
                    
                    mainWindow.webContents.send('tracert-ip', match[0]); // IPを送信
                    found.push(match[0]);
                }
            });
    
            tracertProcess.on('error', (error) => {
                console.error(`exec error: ${error}`);
                return reject([]);
            });
    
            tracertProcess.on('exit', (code) => {
                console.log(`tracert process exited with code: ${code}`);
                const lines = output.split('\n');
                const extractedIPs: string[] = []; // 型を明示的に指定
    
                lines.forEach(line => {
                    const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                    if (match) {
                        extractedIPs.push(match[0]); // IPを配列に追加
                        console.log(`Extracted IP address: ${match[0]}`); // リアルタイムでIPを表示
                    }
                });
    
                resolve(extractedIPs); // 結果を返す
            });
        });
    })

    ipcMain.handle('get-ip-info', async (_, ipAddress) => {
        try {
            const response = await fetch(`https://ipinfo.io/${ipAddress}/json`);
            const data = await response.json();
            return {
                ip: ipAddress,
                location: data.city ? `${data.city}, ${data.region}, ${data.country}` : '情報なし',
                loc: data.loc
            };
        } catch (error) {
            console.error('Error fetching IP info:', error);
            return { ip: ipAddress, location: '情報取得失敗', loc: null };
        }
    });

    ipcMain.handle('read-log', async (_, dirPath) => {
        try {
            const files = fs.readdirSync(dirPath);
            const networkFiles = files.filter(file => file.includes('network-connection'));

            const fileContents = networkFiles.map(file => {
                const filePath = path.join(dirPath, file);
                return fs.readFileSync(filePath, 'utf-8');
            })[0];

            console.log(fileContents);

            const regex = /Send disconnect \(address: ([\d\.]+:\d+), reason: \d+\)/g;
            const matches = fileContents.match(regex);
            if (matches) {
                const addresses = matches.map(match => {
                    const addressMatch = match.match(/address: ([\d\.]+:\d+)/);
                    return addressMatch ? addressMatch[1] : null;
                }).filter(Boolean);
                return addresses;
            }

            return [];

        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
        return [];
    })

    ipcMain.handle('get-files', async (_, dirPath) => {
        const listDir = fs.readdirSync(dirPath)

        return listDir.map((fname) => {
            const datePart = fname.split('_')[1].split('.');
            const timePart = fname.split('_')[2].split('-');

            // Dateオブジェクトを作成
            const date = new Date(Date.UTC(
                parseInt(datePart[0]), // 年
                parseInt(datePart[1]) - 1, // 月（0から始まるため1を引く）
                parseInt(datePart[2]), // 日
                parseInt(timePart[0]), // 時
                parseInt(timePart[1]), // 分
                parseInt(timePart[2]) // 秒
            ))

            return { date, fname };
        })
    });


    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
