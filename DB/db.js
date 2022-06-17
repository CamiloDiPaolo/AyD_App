const oracledb = require("oracledb");
const fs = require("fs");

// consultas para saber el estado de cada modulo
const stateScriptSQL = JSON.parse(
  fs.readFileSync(__dirname + "/SQL_states.json")
);
// consultas para cambiar el estado de un modulo a local
const localScriptSQL = JSON.parse(
  fs.readFileSync(__dirname + "/SQL_local.json")
);
// consultas para cambiar el estado de un modulo a remoto
const remoteScriptSQL = JSON.parse(
  fs.readFileSync(__dirname + "/SQL_remote.json")
);

// por ahora como estamos probando no commiteamos nada
// oracledb.autoCommit = true;

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_STRINGCONNECTION,
  ORACLE_PATH,
} = require("./../config");

// Conectamos con la base de oracle
const path = ORACLE_PATH;
const config = {
  user: DB_USERNAME,
  password: DB_PASSWORD,
  connectString: DB_STRINGCONNECTION,
};
let connection;
(async () => {
  try {
    oracledb.initOracleClient({ libDir: path });
    connection = await oracledb.getConnection(config);
    console.log("la conexion fue exitosa");
  } catch (err) {
    console.log("ERROR: OCURRIO UN ERROR CON LA DB");
    console.log(err);
  }
})();

exports.getModuleState = async (name) => {
  try {
    connection = await oracledb.getConnection(config);
    const result = await connection.execute(stateScriptSQL[name]);
    const { rows } = result;
    return rows[0][1].includes("devdpma") ? "REMOTE" : "LOCAL";
  } catch (err) {
    return err;
  }
};

exports.changeToLocal = async (name) => {
  try {
    connection = await oracledb.getConnection(config);

    // cas funciona de forma distinta
    if (name === "CAS-ACCESO") {
      await localScriptSQL[name].forEach(async (script) => {
        const result = await connection.execute(script);
        // si se modifica mas de una fila entonces no se commitea y se hace rollback
        if (result.rowsAffected !== 1) {
          alert("LA OPERACION SE CANCELO PORQUE SE MODIFICO MAS DE 1 FILA");
          return await connection.execute("ROLLBACK");
        }
      });
      alert(`EL MODULO ${name} AHORA SE ENCUENTRA DE FORMA LOCAL`);
      return;
    }

    // para cualquier otro modulo
    const result = await connection.execute(localScriptSQL[name]);
    // si se modifica mas de una fila entonces no se commitea y se hace rollback
    if (result.rowsAffected !== 1) {
      alert("LA OPERACION SE CANCELO PORQUE SE MODIFICO MAS DE 1 FILA");
      return await connection.execute("ROLLBACK");
    }

    await connection.execute("COMMIT");
    alert(`EL MODULO ${name} AHORA SE ENCUENTRA DE FORMA LOCAL`);
  } catch (err) {
    console.log(err);
  }
};

exports.changeToRemote = async (name) => {
  try {
    connection = await oracledb.getConnection(config);

    // cas funciona de forma distinta
    if (name === "CAS-ACCESO") {
      await remoteScriptSQL[name].forEach(async (script) => {
        const result = await connection.execute(script);
        // si se modifica mas de una fila entonces no se commitea y se hace rollback
        if (result.rowsAffected !== 1) {
          alert("LA OPERACION SE CANCELO PORQUE SE MODIFICO MAS DE 1 FILA");
          return await connection.execute("ROLLBACK");
        }
      });
      alert(`EL MODULO ${name} AHORA SE ENCUENTRA DE FORMA REMOTA`);
      return;
    }

    // para cualquier otro modulo
    const result = await connection.execute(remoteScriptSQL[name]);
    // si se modifica mas de una fila entonces no se commitea y se hace rollback
    if (result.rowsAffected !== 1) {
      alert("LA OPERACION SE CANCELO PORQUE SE MODIFICO MAS DE 1 FILA");
      return await connection.execute("ROLLBACK");
    }

    await connection.execute("COMMIT");
    alert(`EL MODULO ${name} AHORA SE ENCUENTRA DE FORMA REMOTA`);
  } catch (err) {
    console.log(err);
  }
};
