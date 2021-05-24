const moment = require("moment");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getClientRanges = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select cr.id, cr.cpt_id marker_id, c.name marker_name, cr.seq, cr.compare_item, cr.compare_operator,
     cr.compare_to, cr.range_low, cr.range_high
    , cr.created, concat(u.firstname, ' ', u.lastname) created_user, cr.updated
    , concat(u2.firstname, ' ', u2.lastname) updated_user 
    from client_range cr
    left join marker c on c.id=cr.cpt_id
    left join user u on u.id=cr.created_user_id
    left join user u2 on u2.id=cr.updated_user_id
    where cr.client_id=${req.client_id}
    order by c.name, cr.seq
    `
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log("error:", error);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const deleteClientRange = async (req, res) => {
  const { id } = req.params;
  const { marker_name } = req.body.data;
  const db = makeDb(configuration, res);
  try {
    const deleteResponse = await db.query(`delete from client_range where id=?`, [id]);

    await db.query(
      `insert into user_log values (${req.client_id}, ${req.user_id}, now(), null, 'Deleted marker range ${marker_name}')`
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

const resetClientRange = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    await db.query(`delete from client_range where client_id=${req.client_id}`);
    const insertResponse = await db.query(`insert into client_range
      select null, ${req.client_id}, cpt_id marker_id, seq, compare_item, compare_operator, compare_to, range_low, range_high, now(), ${req.user_id}, now(), ${req.user_id}
      from client_range 
      where client_id=1`);
    await db.query(
      `insert into user_log values (${req.client_id}, ${req.user_id}, now(), null, 'Reset all custom marker ranges')`
    );

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

const updateClientRange = async (req, res) => {
  const { id } = req.params;
  const {
    marker_id,
    range_low,
    range_high,
    seq,
    compare_item,
    compare_operator,
    compare_to,
  } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    let $sql;

    $sql = `update client_range set cpt_id='${marker_id}', range_low=${range_low}, range_high=${range_high}`;

    if (seq && typeof seq !== "undefined") {
      $sql += `, seq='${seq}'`;
    }
    if (compare_item && typeof compare_item !== "undefined") {
      $sql += `, compare_item='${compare_item}'`;
    }
    if (compare_operator && typeof compare_operator !== "undefined") {
      $sql += `, compare_operator='${compare_operator}'`;
    }
    if (compare_to && typeof compare_to !== "undefined") {
      $sql += `, compare_to='${compare_to}'`;
    }
    $sql += `, updated='${moment().format("YYYY-MM-DD HH:mm:ss")}',
      updated_user_id=${req.user_id}
      where id=${id}
      `;

    const updateResponse = await db.query($sql);
    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.error).send(errorMessage);
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

const getClientRange = async (req, res) => {
  const { marker_id, seq, compare_item, compare_operator, compare_to } = req.query;

  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(`
      select cr.cpt_id marker_id, c.name marker_name, cr.seq, cr.compare_item, cr.compare_operator, cr.compare_to, cr.range_low, cr.range_high
      , cr.created, concat(u.firstname, ' ', u.lastname) created_user
      , cr.updated, concat(u2.firstname, ' ', u2.lastname) updated_user
      from client_range cr
      left join marker c on c.id=cr.cpt_id
      left join user u on u.id=cr.created_user_id
      left join user u2 on u2.id=cr.updated_user_id
      where cr.client_id=${req.client_id}
      and cr.cpt_id=?
      and cr.seq=?
      and cr.compare_item=?
      and cr.compare_operator=?
      and cr.compare_to=?
    `, [marker_id, seq, compare_item, compare_operator, compare_to]);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log("error:", error);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createClientRange = async (req, res) => {
  const db = makeDb(configuration, res);
  const { marker_id } = req.body.data;
  const client_range = req.body.data;
  client_range.cpt_id = marker_id;
  client_range.created_user_id = req.user_id;
  client_range.client_id = req.client_id;
  client_range.created = new Date();

  delete req.body.data.marker_id; // deleting otherwise request fails

  try {
    const insertResponse = await db.query(
      "insert into client_range set ?",
      client_range
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

const searchTests = async (req, res) => {
  const db = makeDb(configuration, res);

  const { query } = req.query;
  let $sql;
  try {
    $sql = `
      select c.id, c.name
      from cpt c
      where c.type='L'
      and c.name like '%${query}%'
      order by c.name
      limit 20
    `;

    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.error("err:", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const testReport = {
  getClientRanges,
  deleteClientRange,
  resetClientRange,
  updateClientRange,
  getClientRange,
  createClientRange,
  searchTests,
};

module.exports = testReport;
