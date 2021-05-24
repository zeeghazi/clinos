const moment = require("moment");
const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getAllPractitioner = async (req, res) => {
  const db = makeDb(configuration, res);
  let { client_id } = req.query;

  if (typeof client_id === "undefined") {
    // eslint-disable-next-line prefer-destructuring
    client_id = req.client_id;
  }
  let $sql;

  try {
    $sql = `select u.id user_id, concat(u.firstname, ' ', u.lastname) name
    from user u
    where u.client_id=${client_id}
    order by name
    limit 100`;

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

const getPractitionerDates = async (req, res) => {
  const db = makeDb(configuration, res);
  let { client_id } = req.query;

  if (typeof client_id === "undefined") {
    // eslint-disable-next-line prefer-destructuring
    client_id = req.client_id;
  }
  let $sql;

  try {
    $sql = `select id, user_id, date_start, date_end, time_start, time_end, monday, tuesday, wednesday, thursday, friday, active
    from user_schedule
    where client_id=${client_id} 
    and time_start > current_date()`;

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

const getBookedAppointments = async (req, res) => {
  const db = makeDb(configuration, res);
  let { client_id } = req.query;
  const { practitioner_id } = req.query;

  if (typeof client_id === "undefined") {
    // eslint-disable-next-line prefer-destructuring
    client_id = req.client_id;
  }
  let $sql;

  try {
    $sql = `select start_dt, end_dt, patient_id, user_id
    from user_calendar
    where client_id=${req.client_id}
    and user_id=${practitioner_id}
    and status in ('A', 'R')
    and start_dt>now()`;

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

const getAppointmentTypes = async (req, res) => {
  const db = makeDb(configuration, res);

  const { practitioner_id } = req.body.data;

  let $sql;

  try {
    $sql = `select at.id, at.appointment_type, at.descr, at.length, at.fee
    from appointment_type at 
    where at.client_id=${req.client_id} 
    /*and atu.user_id=${practitioner_id}*/
    and at.active=true
    and at.allow_patients_schedule=true
    order by at.sort_order 
    limit 100
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

const createAppointment = async (req, res) => {
  const {
    start_dt,
    end_dt,
    user_id,
    status: appStatus,
    patient_id,
    reschedule,
    appointment_type_id,
  } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into user_calendar (client_id, user_id, patient_id, appointment_type_id, start_dt, end_dt, status, reschedule, created, created_user_id) values (${
        req.client_id
      }, ${user_id}, ${patient_id}, ${appointment_type_id}, '${moment(
        start_dt,
        "YYYY-MM-DD HH:mm:ss"
      ).format("YYYY-MM-DD HH:mm:ss")}', '${moment(
        end_dt,
        "YYYY-MM-DD HH:mm:ss"
      ).format(
        "YYYY-MM-DD HH:mm:ss"
      )}', '${appStatus}', ${reschedule}, now(), ${req.user_id})`
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

const updateAppointment = async (req, res) => {
  const db = makeDb(configuration, res);
  const appointmentId = req.params.id;
  const formData = req.body.data;
  formData.updated = new Date();
  formData.updated_user_id = req.user_id;

  try {
    const updateResponse = await db.query(
      `update user_calendar set ? where id=${appointmentId}`,
      [formData]
    );
    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }
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

const Appointments = {
  getAllPractitioner,
  getPractitionerDates,
  getBookedAppointments,
  getAppointmentTypes,
  createAppointment,
  updateAppointment,
};

module.exports = Appointments;
