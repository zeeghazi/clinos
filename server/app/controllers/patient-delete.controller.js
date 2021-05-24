const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const deletePatient = async (req, res) => {
  const tables = {
    encounter: "encounter",
    lab: "lab",
    lab_cpt: "lab cpt",
    patient_allergy: "patient allergy",
    patient_cpt: "patient cpt",
    patient_drug: "patient drug",
    patient_form: "patient form",
    patient_handout: "patient handout",
    patient_icd: "patient icd",
    payment_method: "payment method",
    tran: "transaction",
    user_calendar: "user calendar",
  };

  const { id } = req.params;
  const db = makeDb(configuration, res);
  try {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in tables) {
      // eslint-disable-next-line no-await-in-loop
      const dbResponse = await db.query(
        `select 1
        from ${key}
        where patient_id=${id}
        limit 1`
      );

      if (dbResponse.length > 0) {
        errorMessage.message = `Patient can't be deleted because there is ${tables[key]} data for this patient`;
        return res.status(status.error).send(errorMessage);
      }
      // eslint-disable-next-line no-await-in-loop
      const deleteResponse = await db.query(
        `delete
          from patient
          where id=${id}`
      );

      // eslint-disable-next-line no-await-in-loop
      await db.query(
        `delete
          from user_log
          where patient_id=${id}`
      );

      // eslint-disable-next-line no-await-in-loop
      await db.query(
        `insert into user_log values (${req.client_id}, ${req.user_id}, now(), null, 'Deleted patient {patient.id} {patient.firstname} {patient.lastname}')`
      );

      if (!deleteResponse.affectedRows) {
        errorMessage.message = "Deletion not successful";
        return res.status(status.notfound).send(errorMessage);
      }

      successMessage.data = deleteResponse;
      successMessage.message = "Delete successful";
      return res.status(status.created).send(successMessage);
    }
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Delete not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const patientDelete = {
  deletePatient,
};

module.exports = patientDelete;
