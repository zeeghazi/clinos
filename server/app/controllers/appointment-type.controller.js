const { validationResult } = require("express-validator");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getAll = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select at.id, at.appointment_type, at.descr, at.length, at.fee, at.allow_patients_schedule, at.sort_order, at.note, at.active, at.client_id
      , at.created
      , concat(u.firstname, ' ', u.lastname) created_user
      , at.updated
      , concat(u2.firstname, ' ', u2.lastname) updated_user
      from appointment_type at
      left join user u on u.id=at.created_user_id
      left join user u2 on u2.id=at.updated_user_id
      where at.client_id=${req.client_id}
      order by at.sort_order, at.appointment_type
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

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.bad).send(errorMessage);
  }
  const db = makeDb(configuration, res);
  const appointment_type = req.body.data;
  appointment_type.created_user_id = req.user_id;
  appointment_type.client_id = req.client_id;
  appointment_type.created = new Date();

  try {
    const dbResponse = await db.query(
      "insert into appointment_type set ?",
      appointment_type
    );

    if (!dbResponse.insertId) {
      errorMessage.message = "Creation not successful";
      res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    successMessage.message = "Creation successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.error(err);
    errorMessage.message = "Creation not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }

  const db = makeDb(configuration, res);
  const appointment_type = req.body.data;

  appointment_type.updated = new Date();
  appointment_type.updated_user_id = req.user_id;

  try {
    const updateResponse = await db.query(
      `update appointment_type set ? where id =${req.params.appointmentId}`,
      [appointment_type]
    );

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

const deleteAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }
  const { id } = req.params;
  const db = makeDb(configuration, res);
  try {
    const deleteApptResponse = await db.query(
      `delete from appointment_type_user where appointment_type_id=?`, [id]
    );
    console.log("deleteApptResponse:", deleteApptResponse);
    const deleteResponse = await db.query(
      `delete from appointment_type where id=?`, [id]
    );

    if (!deleteResponse.affectedRows) {
      errorMessage.message = "Deletion not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = deleteResponse;
    successMessage.message = "Deletion successful";
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.message = "Deletion not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const appointmentTypes = {
  getAll,
  create,
  update,
  deleteAppointment,
};

module.exports = appointmentTypes;
