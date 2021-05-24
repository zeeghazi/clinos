const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getAllMessages = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;

  try {
    $sql = `select m.id, m.user_id_to, m.user_id_from, m.patient_id_from, m.patient_id_to, m.created
    , concat(u.firstname, ' ', u.lastname) user_to_from
    , concat(u2.firstname, ' ', u2.lastname) user_to_name
    , concat(p.firstname, ' ', p.lastname) patient_to_from
    , concat(p2.firstname, ' ', p2.lastname) patient_to_name
    , m.message
    from message m
    left join user u on u.id=m.user_id_from
    left join user u2 on u2.id=m.user_id_to
    left join patient p on p.id=m.patient_id_from
    left join patient p2 on p2.id=m.patient_id_to
    where (patient_id_from=${patient_id} or patient_id_to=${patient_id})
    order by m.created desc
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

const getUsers = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const $sql = `select u.id, u.firstname, u.lastname
      from user u
      where u.client_id=${req.client_id}
      order by u.firstname
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

const createMessage = async (req, res) => {
  const { user_id_to, subject, message } = req.body.data;
  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into message (client_id, user_id_to, patient_id_from, subject, message,  status, created) values (${req.client_id}, ${user_id_to}, ${req.user_id}, '${subject}', '${message}', 'O', now())`
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

const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  let { msgStatus } = req.body.data;
  const { user_id_to, subject, message } = req.body.data;

  const db = makeDb(configuration, res);

  if (typeof msgStatus !== "undefined") {
    msgStatus = `'${msgStatus}'`;
  } else {
    msgStatus = null;
  }

  try {
    let $sql = `update message set user_id_to=${user_id_to}, subject='${subject}', message='${message}', status=${msgStatus}, read_dt=now() `;
    $sql += `, updated=now(), updated_user_id=${req.user_id} where id=${messageId}`;

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

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const db = makeDb(configuration, res);
  try {
    await db.query(`
      delete 
      from message_history 
      where id=${messageId}
    `);
    const deleteResponse = await db.query(`
      delete 
      from message 
      where id=${messageId}
    `);

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

const getSingleMessage = async (req, res) => {
  const db = makeDb(configuration, res);
  let $sql;
  try {
    $sql = `select cp.id, cp.header
      from client_portal cp
      where cp.id =${req.client_id}`;

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

const Messages = {
  getAllMessages,
  getUsers,
  createMessage,
  updateMessage,
  deleteMessage,
  getSingleMessage,
};

module.exports = Messages;
