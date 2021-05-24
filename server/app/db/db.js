const mysql = require("mysql");
const util = require("util");
const config = require("../../config.js");
const { errorMessage, status } = require("../helpers/status");

const dbConfig = config.dbconfig;

const configuration = {
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  port: dbConfig.PORT,
  database: dbConfig.DB,
};

async function withTransaction(db, callback) {
  try {
    await db.beginTransaction();
    await callback();
    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  } finally {
    await db.close();
  }
}

function makeDb(databaseConfig, res) {
  const connection = mysql.createConnection(databaseConfig);
  connection.connect(function (error) {
    if (error) {
      console.error(`error connecting: ${error.stack}`);

      if (error.code === "ECONNREFUSED") {
        errorMessage.message =
          "Something went wrong with the database connection";
        return res.status(status.error).send(errorMessage);
      }
      errorMessage.message = "Something went wrong with the database query";
      return res.status(status.error).send(errorMessage);
    }
    return false;
  });
  return {
    query(sql, args) {
      if (process.env.NODE_ENV === "development") {
        console.log(sql);
        if (args) {
          console.log(args);
        }
      }
      connection.query("SET SESSION group_concat_max_len = 10000"); // To increase default length of group_concat
      return util.promisify(connection.query).call(connection, sql, args);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    },
  };
}

const db = {
  configuration,
  makeDb,
  withTransaction,
};

module.exports = db;
