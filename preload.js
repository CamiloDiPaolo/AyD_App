const DB = require("./db");

const modulos = ["EU", "GEDO", "EE"];

window.addEventListener("DOMContentLoaded", async () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }

  document.getElementById("btn-test").addEventListener("click", async () => {
    // const res = await DB.testDB();
    // console.log(res);
    // mostramos el estado de todos los modulos
    modulos.forEach(async (modulo) => {
      const result = await DB.getModuleState(modulo);
      const { rows } = result;
      // console.log(rows[0][0]);
      console.log(`${modulo} :: ESTADO: ${rows[0][0]}`);
    });
  });

  document
    .getElementById("btn-eu-local")
    .addEventListener("click", async () => {
      DB.switchModuleState("EU", "Local");
    });
  document
    .getElementById("btn-eu-remote")
    .addEventListener("click", async () => {
      DB.switchModuleState("EU", "Remote");
    });
});
