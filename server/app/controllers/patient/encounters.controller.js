const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getAllencounters = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;

  try {
    $sql = `select e.dt, concat(u.firstname, ' ', u.lastname) user_from, concat(p.firstname, ' ', p.lastname) patient_to, e.treatment
    from encounter e
    left join patient p on p.id=e.patient_id
    left join user u on u.id=e.user_id
    where e.patient_id=${patient_id}
    order by e.dt desc
    limit 100`;

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

const updateEncounter = async (req, res) => {
  const { encounterId } = req.params;
  const db = makeDb(configuration, res);

  try {
    const $sql = `update encounter
    set read_dt=now(), updated=now(), updated_user_id=${req.user_id}
    where client_id=${req.client_id}
    and patient_id=${req.user_id}
    and read_dt is null and id=${encounterId}`;

    const updateResponse = await db.query($sql);

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

const Encounter = {
  getAllencounters,
  updateEncounter,
};

module.exports = Encounter;
