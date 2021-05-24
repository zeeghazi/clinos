const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getUserMessageById = async (req, res) => {
  const { id } = req.params;
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select m.id, m.created
      , concat(p.firstname, ' ', p.lastname) patient_from_name
      , concat(u.firstname, ' ', u.lastname) user_to_name
      , m.status, m.message, m.note_assign
      , m.patient_id_from, m.user_id_to
      from message m
      left join patient p on p.id=m.patient_id_from
      left join user u on u.id=m.user_id_to
      where m.id=${id}
      `
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

const getUserMessage = async (req, res) => {
  const db = makeDb(configuration, res);
  const { provider_id } = req.params;
  try {
    const dbResponse = await db.query(
      `/*Message To User*/
      select m.id, m.created
      , concat(p.firstname, ' ', p.lastname) patient_from_name
      , concat(u.firstname, ' ', u.lastname) user_to_name
      , m.status, m.message, m.note_assign
      , m.patient_id_from, m.user_id_to
      from message m
      left join patient p on p.id=m.patient_id_from
      left join user u on u.id=m.user_id_to
      where m.patient_id_from=(
          select m.patient_id_from
          from message m
          where m.id=(
              select min(m.id) id
              from message m
              where m.user_id_to=${provider_id}
              and m.status='O'
              )
      )
      and m.user_id_to=${provider_id}
      and m.status='O'
      order by m.created
      limit 10
      `
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

const getMessageAssignUser = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select firstname, lastname 
      from user 
      where client_id=${req.client_id} 
      /*and status='A'*/
      order by 1, 2
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

const createMessage = async (req, res) => {
  const { user_id_from, subject, message } = req.body.data;
  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into message (client_id, user_id_from, subject, message, created, created_user_id) values 
      (${req.client_id}, ${user_id_from}, '${subject}', '${message}', now(), ${req.user_id})`
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
  const { message_status, user_id_to, note_assign } = req.body.data;
  const { id } = req.params;
  const db = makeDb(configuration, res);
  const msgHistoryData = {};
  msgHistoryData.id = id;

  try {
    const updateResponse = await db.query(
      `update message set user_id_to='${user_id_to}', note_assign='${note_assign}', status='${message_status}',
         updated= now(), updated_user_id='${req.user_id}' where id=${id}`
    );

    await db.query(
      `insert into message_history (id, user_id_to, note_assign, status, created, created_user_id) 
      values (${id}, ${user_id_to}, '${note_assign}', '${message_status}', now(), ${req.user_id});`
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

const getUserMessageHistory = async (req, res) => {
  const { messageId } = req.params;
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select concat(u2.firstname, ' ', u2.lastname) assigned_to
      , mh.status, mh.created updated
      , concat(u.firstname, ' ', u.lastname) updated_by
      from message_history mh
      left join user u on u.id=mh.created_user_id
      left join user u2 on u2.id=mh.user_id_to
      where mh.client_id=${req.client_id}
      and mh.id=${messageId}
      order by mh.created desc
      limit 50
      `
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

const getMessageUserHistory = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select l.updated, concat(u.firstname, ' ', u.lastname) updated_name
      , concat(p.firstname, ' ', p.lastname) patient_name
      , concat(u2.firstname, ' ', u2.lastname) assigned_name
      , l.note_assign, l.id
      from message l
      left join patient p on p.id=l.patient_id_from
      left join user u on u.id=l.updated_user_id
      left join user u2 on u2.id=l.user_id_to
      where l.client_id=${req.client_id}
      and l.updated_user_id=${req.user_id}
      order by l.updated desc 
      limit 50
      `
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

const messageToPatient = {
  getUserMessageById,
  getUserMessage,
  getMessageAssignUser,
  createMessage,
  updateMessage,
  getUserMessageHistory,
  getMessageUserHistory,
};

module.exports = messageToPatient;
