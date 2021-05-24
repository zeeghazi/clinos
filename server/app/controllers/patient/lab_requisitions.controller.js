const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getLabRequitions = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;
  try {
    $sql = `select e.id, e.dt, left (group_concat(c.name order by c.name), 100) lab
    from encounter e
    join patient_cpt pc on pc.encounter_id=e.id
    join cpt c on c.id=pc.cpt_id
    where pc.patient_id=${patient_id}
    group by e.id
    order by e.id desc
    limit 50`;

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

const getTestList = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;
  try {
    $sql = `select t.id, t.dt, group_concat(c.name separator ", ") tests
    from tranc t
    left join tranc_detail td on td.tranc_id = t.id
    left join cpt c on c.id = td.cpt_id
    where t.patient_id = ${patient_id} 
    and t.completed_dt is null
    group by t.id, t.dt`;

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

const getTestProfileInfo = async (req, res) => {
  const db = makeDb(configuration, res);

  const { testId } = req.query;

  let $sql;
  try {
    $sql = `select t.id, t.ulta_order, t.amount, t.patient_id, p.firstname, p.lastname, p.address, p.address2, p.city, p.state, p.postal, p.phone_home, p.dob, p.gender
    from tranc t
    join patient p on p.id=t.patient_id
    where t.id = ${testId}`;

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

const getProfileTests = async (req, res) => {
  const db = makeDb(configuration, res);

  const { testId } = req.query;

  let $sql;
  try {
    $sql = `select ci.quest_id, q.name quest_name
    from tranc_detail td
    join cpt c on c.id = td.cpt_id
    join cpt_item ci on ci.cpt_id = c.id
    join quest q on q.id = ci.quest_id
    where tranc_id = ${testId}
    order by q.name`;

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

const labRequitions = {
  getLabRequitions,
  getTestList,
  getTestProfileInfo,
  getProfileTests,
};

module.exports = labRequitions;
