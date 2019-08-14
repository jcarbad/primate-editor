const electron = require('electron')
const {app, BrowserWindow, ipcMain, dialog, Menu} = electron
const fs = require('fs')

let window,
    filepath

app.on('ready', _ => {
    window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    window.loadFile('index.html')

    //create new menu
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
})

ipcMain.on('save', (event, msg) => {
    if (!filepath) {
        dialog.showSaveDialog(window, {defaultPath: 'filename.txt'}, fullpath => {
            if (fullpath) {
                filepath = fullpath
                saveFile(msg)
            }
        })
    } else {
        saveFile(msg)
    }  
})

function saveFile(content) {
    fs.writeFile(filepath, content, err => {
        if (err) throw err
        console.log('File saved!')
        window.webContents.send('saved', 'success')
    })
}

const menuTemplate = [
    // First "App" menu if we are on macOS // JS spread operator (???)
    ...(process.platform == 'darwin' ? [{
        label: app.getName(),
        submenu: [
            { role: 'about' }
        ]
    }] : 
    // This breaks Windows version
    [{}]),
    {
        label: 'File',
        submenu: [
            {
                label: 'Save',
                //Keyboard shortcut
                accelerator: 'CmdOrCtrl+S',
                click: _ => window.webContents.send('save-clicked') 
            },
            {
                label: 'Save As',
                accelerator: 'CmdOrCtrl+Shift+S',
                click: _ => { 
                    filepath = undefined
                    window.webContents.send('save-clicked')
                }
            }
        ]
    },
    // Convenience Electron shortcut
    { role: 'editMenu' },
    { role: 'viewMenu' }
]
