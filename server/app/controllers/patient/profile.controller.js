const moment = require("moment");
const bcrypt = require("bcryptjs");
const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getPatient = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    // eslint-disable-next-line prefer-destructuring
    patient_id = req.user_id;
  }
  let $sql;
  try {
    $sql = `select p.status, p.id, p.firstname, p.middlename, p.lastname, p.gender, p.phone_home, p.phone_cell, p.phone_work, p.phone_other, p.phone_note, p.ssn
    , p.address, p.address2, p.city, p.postal, p.state, p.country, p.insurance_name, p.insurance_group, p.insurance_member, p.insurance_phone, p.insurance_desc, p.email
    from patient p
    where p.id=${patient_id}`;

    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.info("err:", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const updatePatient = async (req, res) => {
  const formData = req.body.data;
  formData.created = new Date();
  formData.created_user_id = req.user_id;

  if (formData.password && formData.password !== "") {
    formData.password = bcrypt.hashSync(formData.password, 8);
  } else {
    delete formData.password;
  }

  const db = makeDb(configuration, res);

  try {
    const updateResponse = await db.query(
      `update patient set ? where id=${req.user_id}`,
      [formData]
    );
    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    const patientData = req.body.data;
    if (typeof dob !== "undefined") {
      patientData.dob = moment(patientData.dob).format("YYYY-MM-DD");
    }
    patientData.created = new Date();
    patientData.created_user_id = req.user_id;

    // Log into patient_history
    await db.query("insert into patient_history set ?", patientData);

    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getPatientPaymentMethod = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;

  try {
    $sql = `select id, type, account_number, exp, created 
    from payment_method 
    where patient_id=${patient_id}
    and (status is null or status <> 'D')
    order by 1
    `;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.info("err:", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const Profile = {
  getPatient,
  updatePatient,
  getPatientPaymentMethod,
};

module.exports = Profile;
