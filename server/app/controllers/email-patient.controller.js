const moment = require("moment");
const { validationResult } = require("express-validator");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getHistory = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select e.created, e.message, e.subject, concat(u.firstname, ' ', u.lastname) created_user,
       e.status_active, e.status_inactive, e.send_status, e.client_id
        from email_bulk_history e
        left join user u on u.id=e.created_user_id
        where e.client_id=${req.client_id}
        order by e.created desc 
        limit 50
      `
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createEmailHistory = async (req, res) => {
  const formData = req.body.data;
  formData.client_id = req.client_id;
  formData.created = new Date();
  formData.created_user_id = req.user_id;

  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into email_bulk_history set ?`, [formData]
    );

    if (!insertResponse.affectedRows) {
      errorMessage.message = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const updateEmailHistory = async (req, res) => {
  const { emailData } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    const updateResponse = await db.query(`update email_bulk_history set ? 
    where client_id='${emailData.client_id}' and created='${moment(
      emailData.created
    ).format("YYYY-MM-DD HH:mm:ss")}'`, [emailData]);

    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.error(error);
    errorMessage.message = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const deleteHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.bad).send(errorMessage);
  }
  const { date } = req.params;
  const db = makeDb(configuration, res);
  try {
    const deleteResponse = await db.query(
      `delete 
        from email_bulk_history
        where client_id=${req.client_id}
        and created='${date}'
      `
    );

    if (!deleteResponse.affectedRows) {
      errorMessage.message = "Deletion not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = deleteResponse;
    successMessage.message = "Delete successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Delete not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const appointmentTypes = {
  getHistory,
  createEmailHistory,
  updateEmailHistory,
  deleteHistory,
};

module.exports = appointmentTypes;
