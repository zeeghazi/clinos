const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getLabById = async (req, res) => {
  const db = makeDb(configuration, res);
  const { labId } = req.params;

  try {
    const dbResponse = await db.query(
      `select l.id, l.filename, l.created, l.status, lab_dt, l.source, lc.name lab_company, concat(p.firstname, ' ', p.lastname) patient_name, p.id patient_id, p.gender, p.dob, l.type, l.note, l.user_id assigned_to, l.note_assign, l.client_id
      from lab l
      left join lab_company lc on lc.id=l.lab_company_id
      left join patient p on p.id=l.patient_id
      where l.id=${labId}`
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

const getAll = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select l.id, l.filename, l.created, l.status, lab_dt, l.source, lc.name lab_company, concat(p.firstname, ' ', p.lastname) patient_name, p.id patient_id, p.gender, p.dob, l.type, l.note, l.user_id assigned_to, l.note_assign, l.client_id
        from lab l
        left join lab_company lc on lc.id=l.lab_company_id
        left join patient p on p.id=l.patient_id
        where l.user_id = ${req.user_id}
        and l.status = 'R'
        order by l.created
        limit 1`
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

const createLab = async (req, res) => {
  const { lab_id, patient_id, user_id, note } = req.body.data;
  let { type, note_assign } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    // Call DB query without assigning into a variable
    if (typeof type === "undefined") {
      type = null;
    }
    if (typeof note_assign === "undefined") {
      note_assign = null;
    }

    await db.query(
      `insert into lab_history (id, user_id, patient_id, type, note_assign, created, created_user_id) values 
        (${lab_id}, ${user_id}, ${patient_id}, '${type}', '${note_assign}', now(), ${req.user_id})`
    );

    let $sql;
    $sql = `update lab set patient_id='${patient_id}'`;

    if (typeof type !== "undefined") {
      $sql += `, type='${type}'`;
    }
    if (typeof note !== "undefined") {
      $sql += `, note='${note}'`;
    }
    if (typeof note_assign !== "undefined") {
      $sql += `, note_assign='${note_assign}'`;
    }

    $sql += `, updated=now(), updated_user_id=${req.user_id} where user_id=${req.user_id} and id=${lab_id}`;

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

const updateLabStatus = async (req, res) => {
  const { labId } = req.params;
  const { labStatus } = req.body.data;

  const db = makeDb(configuration, res);

  try {
    const $sql = `update lab set status='${labStatus}', updated=now(), updated_user_id=${req.user_id} where user_id=${req.user_id} and id=${labId}`;
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

const updateLab = async (req, res) => {
  const { labId } = req.params;
  let { user_id, patient_id, type, note, note_assign } = req.body.data;
  const db = makeDb(configuration, res);

  try {
    if (typeof user_id === "undefined") {
      user_id = null;
    }
    if (typeof patient_id === "undefined") {
      patient_id = null;
    }
    if (typeof type === "undefined") {
      type = null;
    }
    if (typeof note_assign === "undefined") {
      note_assign = null;
    }
    if (typeof note === "undefined") {
      note = null;
    }
    await db.query(
      `insert into lab_history (id, user_id, patient_id, type, note, note_assign, created, created_user_id) values 
        (${labId}, ${user_id}, ${patient_id}, '${type}', '${note}', '${note_assign}', now(), ${req.user_id})`
    );

    let $sql;
    $sql = `update lab set id='${labId}'`;

    if (typeof type !== "undefined") {
      $sql += `, type='${type}'`;
    }
    if (typeof user_id !== "undefined") {
      $sql += `, user_id='${user_id}'`;
    }
    if (typeof note !== "undefined") {
      $sql += `, note='${note}'`;
    }
    if (typeof note_assign !== "undefined") {
      $sql += `, note_assign='${note_assign}'`;
    }

    $sql += ` where id=${labId}`;

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

const getLabHistory = async (req, res) => {
  const db = makeDb(configuration, res);
  const { labId } = req.params;

  try {
    const dbResponse = await db.query(
      `select lh.created
      , concat(u.firstname, ' ', u.lastname) created_by
      , lh.status
      , lh.type
      , concat(u2.firstname, ' ', u2.lastname) assigned_to
      , lh.note_assign assignment_note
      , concat(p.firstname, ' ', p.lastname) patient
      , lh.note
      from lab_history lh
      left join user u on u.id=lh.created_user_id
      left join user u2 on u2.id=lh.user_id
      left join patient p on p.id=lh.patient_id
      where lh.client_id=${req.client_id}
      and lh.id=${labId}
      order by lh.created desc
      limit 50`
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

const getLabUserHistory = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select lh.created, lh.id
      , concat(u.firstname, ' ', u.lastname) created_name
      , concat(u2.firstname, ' ', u2.lastname) assigned_name
      , lh.patient_id, lh.type, lh.note, lh.note_assign, lh.status
      from lab_history lh
      left join user u on u.id=lh.created_user_id
      left join user u2 on u2.id=lh.user_id
      where lh.created_user_id=${req.user_id}
      order by lh.created desc
      limit 50`
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

const getLabValues = async (req, res) => {
  const db = makeDb(configuration, res);
  const { labId } = req.params;

  try {
    const dbResponse = await db.query(
      `select c.id, c.name, lc.value, lc.range_low, lc.range_high, lc.unit
      from lab_marker lc
      left join marker c on c.id=lc.cpt_id
      where lc.lab_id=${labId}
      and lc.client_id=${req.client_id}
      order by lc.line_nbr
      limit 200`
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

const getAssignUser = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select concat(firstname, ' ', lastname) name, id
      from user 
      where client_id=${req.client_id}
      and status<>'D' 
      order by 1
      limit 50`
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

const processLab = {
  getAll,
  getLabById,
  createLab,
  updateLab,
  updateLabStatus,
  getLabHistory,
  getLabUserHistory,
  getLabValues,
  getAssignUser,
};

module.exports = processLab;
