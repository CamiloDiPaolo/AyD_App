const oracledb = require("oracledb");
oracledb.autoCommit = true;
const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_STRINGCONNECTION,
  ORACLE_PATH,
} = require("./config");

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

exports.testDB = async () => {
  try {
    const result = await connection.execute(
      "SELECT * FROM EU_GED.property_configuration WHERE clave LIKE '%app.gedo.url%'"
    );
    return result;
  } catch (err) {
    return err;
  }
};

exports.getModuleState = async (name) => {
  try {
    const result = await connection.execute(
      `SELECT valor FROM EU_GED.property_configuration WHERE clave = 'app.url' and configuracion = '${name}'`
    );
    return result;
  } catch (err) {
    return err;
  }
};

exports.switchModuleState = async (name, state) => {
  let key, endpoint, config;
  if (name === "EU") {
    key = "app.url";
    endpoint = "eu-web";
    config = "EU";

    if (state === "Local") await changeToLocal(config, key, endpoint);
    if (state === "Remote") await changeToRemote(config, key, endpoint);
  }
};

const changeToLocal = async (config, key, endpoint) => {
  try {
    await connection.execute(
      `UPDATE EU_GED.PROPERTY_CONFIGURATION 
                              SET VALOR='http://localhost:8082/${endpoint}' 
                              WHERE VALOR='https://eu.devdpma.gdeba.gba.gob.ar/${endpoint}' AND CLAVE='${key}' AND CONFIGURACION='${config}'`
    );
  } catch (err) {
    console.log(err);
  }
};

const changeToRemote = async (config, key, endpoint) => {
  try {
    await connection.execute(
      `UPDATE EU_GED.PROPERTY_CONFIGURATION 
                              SET VALOR='https://eu.devdpma.gdeba.gba.gob.ar/${endpoint}' 
                              WHERE VALOR='http://localhost:8082/${endpoint}' AND CLAVE='${key}' AND CONFIGURACION='${config}'`
    );
  } catch (err) {
    console.log(err);
  }
};
