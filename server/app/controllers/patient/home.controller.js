const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getClientPortalHeader = async (req, res) => {
  const db = makeDb(configuration, res);
  let { client_id } = req.query;

  if (typeof client_id === "undefined") {
    // eslint-disable-next-line prefer-destructuring
    client_id = req.client_id;
  }

  try {
    const $sql = `select cp.id, cp.header
      from client_portal cp
      where cp.id =${client_id}`;

    const dbResponse = await db.query($sql);

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

const getClientPortalForms = async (req, res) => {
  const db = makeDb(configuration, res);
  let { client_id } = req.query;

  if (typeof client_id === "undefined") {
    // eslint-disable-next-line prefer-destructuring
    client_id = req.client_id;
  }

  try {
    const $sql = `select cf.id, cf.title, pf.patient_id, pf.sign_dt
    from client_form cf
    left join patient_form pf on pf.patient_id=cf.id
    where cf.client_id=${client_id}
    and cf.active is true
    and (pf.patient_id is null or pf.sign_dt is null)`;

    const dbResponse = await db.query($sql);

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

const getUpcomingAppointments = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;

  try {
    $sql = `select uc.id, uc.patient_id, uc.user_id, uc.appointment_type_id, at.length as appointment_type_length, uc.start_dt, uc.end_dt, uc.status, concat(u.firstname, ' ', u.lastname) provider
    from user_calendar uc
    join user u on u.id=uc.user_id
    left join appointment_type at on at.id=uc.appointment_type_id
    where uc.patient_id=${patient_id}
    and uc.start_dt>now()
    `;

    const dbResponse = await db.query($sql);

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

const Home = {
  getClientPortalHeader,
  getClientPortalForms,
  getUpcomingAppointments,
};

module.exports = Home;
