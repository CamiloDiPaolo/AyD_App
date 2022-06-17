const fs = require("fs");
const db = require("./DB/db");

// por las dudas sacamos iop pq su script de estado es medio raro
const modules = ["EU", "EE", "GEDO", "EE-REST", "REDIP", "MULE", "CAS-ACCESO"];

// templates
const moduleTemplate = fs
  .readFileSync(__dirname + "/templates/module-li.html")
  .toString();
const remoteIcon = fs
  .readFileSync(__dirname + "/templates/remote-icon.html")
  .toString();
const localIcon = fs
  .readFileSync(__dirname + "/templates/local-icon.html")
  .toString();

window.addEventListener("DOMContentLoaded", async () => {
  modules.forEach((module) => {
    // creamos el nuevo elemento de la lista
    document.querySelector("ul").innerHTML += moduleTemplate.replace(
      /%MODULE_NAME%/g,
      module
    );
  });

  await loadModulesStates();
});

const loadModulesStates = async () => {
  console.log("aaa");
  // cargamos los estados de todos los modulos
  document.querySelectorAll(".module").forEach(async (moduleHTML, i) => {
    const moduleState = await db.getModuleState(modules[i]);
    console.log(modules[i], moduleHTML, moduleState);
    moduleHTML.innerHTML = moduleHTML.innerHTML
      .replace(
        "%MODULE_STATE%",
        moduleState === "REMOTE" ? remoteIcon : localIcon
      )
      .replace(
        "%INITIAL_STATE%",
        moduleState === "REMOTE" ? "switch-active" : ""
      );

    // agregamos funcionalidad a los switches
    const switchState = moduleHTML.querySelector(".switch-state");
    switchState.addEventListener("click", (e) => {
      const state = switchState.querySelector(".state");
      const module = switchState.dataset.module;
      console.log(module, state);
      console.log(module);
      if (state.classList.contains("switch-active")) {
        // Si el modulo esta en remoto
        console.log("cambio a local de", modules[i]);
        // cambiamos el modulo actual a local
        state.classList.add("switch-loading");
        db.changeToLocal(modules[i]).then((res) => {
          state.classList.remove("switch-loading");
          console.log("cambio");
        });
        // una vez que la carga termina movemos el switch
        state.classList.remove("switch-active");
        state.innerHTML = localIcon;
      } else {
        // si el modulo esta en local
        console.log("cambio a remoto de", modules[i]);
        // cambiamos el modulo actual a remoto
        state.classList.add("switch-loading");
        db.changeToRemote(modules[i]).then((res) => {
          state.classList.remove("switch-loading");
          console.log("cambio");
        });
        state.classList.add("switch-active");
        state.innerHTML = remoteIcon;
      }
    });
  });
};
