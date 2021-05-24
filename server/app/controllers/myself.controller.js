const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getProfile = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select firstname, lastname, email, title, created, email_forward_user_id, phone, status
      from user 
      where id=${req.params.userId}
      `
    );

    if (!dbResponse || dbResponse === 0) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse[0];
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }

  const db = makeDb(configuration, res);
  const { data } = req.body;

  data.updated = moment().format("YYYY-MM-DD HH:mm:ss");
  data.updated_user_id = req.user_id;

  // Convert date format
  data.created = moment(data.created).format("YYYY-MM-DD HH:mm:ss");

  // Hash the password
  if (data.password) data.password = bcrypt.hashSync(data.password, 8);

  try {
    const updateResponse = await db.query(
      `update user set ? where id =${req.params.userId}`,
      [data]
    );

    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.message = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getForwardEmail = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select u.id, concat(u.firstname, ' ', u.lastname) name
      from user u 
      where u.client_id=${req.client_id}
      and u.id<>${req.params.userId}
      order by name
      limit 100
      `
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getLogins = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select dt, ip
      from user_login 
      where user_id=${req.params.userId}
      order by dt desc
      limit 20
      `
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getActivityHistory = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select ul.dt, concat(p.firstname, ' ', p.lastname) patient, p.id patient_id, ul.action
      from user_log ul
      left join patient p on p.id=ul.patient_id
      where ul.user_id=${req.params.userId}
      order by ul.dt desc
      limit 20
      `
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const myself = {
  getProfile,
  updateProfile,
  getForwardEmail,
  getLogins,
  getActivityHistory,
};

module.exports = myself;
