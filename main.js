// probamos cosas en electron
const { app, BrowserWindow } = require("electron");
const path = require("path");
const DB = require("./db");

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // esperamos a que se cargue el dom para modificarlo
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("src/index.html");

  const contents = win.webContents;
  //   console.log(contents);

  //   win.webContents.send("DBLoad", await DB.testDB());
};

app.whenReady().then(async () => {
  createWindow();
});

app.on("window-all-closed", () => {
  console.log("cerraste la ventana");
  app.quit();
});
