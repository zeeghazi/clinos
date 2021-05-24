const { validationResult } = require("express-validator");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const search = async (req, res) => {
  const db = makeDb(configuration, res);
  const { searchTerm, checkBox } = req.body;
  let $sql;

  try {
    $sql = `select i.id, i.name, ci.favorite, ci.updated, concat(u.firstname, ' ', u.lastname) updated_name
            from icd i
            left join client_icd ci on ci.icd_id=i.id and ci.client_id=${req.client_id}
            left join user u on u.id=ci.updated_user_id
            where 1 \n`;
    if (searchTerm) {
      $sql += `and i.name like '${searchTerm}%' \n`;
    }
    if (checkBox === true) {
      $sql += `and ci.favorite = true \n`;
    }

    $sql += `order by i.name \n`;
    $sql += `limit 100 \n`;

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

const addFavorite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.bad).send(errorMessage);
  }
  const db = makeDb(configuration, res);
  const client_icd = req.body;
  client_icd.client_id = req.client_id;
  client_icd.icd_id = req.body.icd_id;
  client_icd.favorite = true;
  client_icd.created = new Date();
  client_icd.created_user_id = req.user_id;
  client_icd.updated = new Date();
  client_icd.updated_user_id = req.user_id;

  try {
    const dbResponse = await db.query(
      "insert into client_icd set ?",
      client_icd
    );

    if (!dbResponse) {
      errorMessage.message = "Creation not successful";
      res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    successMessage.message = "Creation successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Creation not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const deleteFavorite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }
  const db = makeDb(configuration, res);
  try {
    const deleteResponse = await db.query(
      `delete from client_icd where client_id=${req.client_id} and icd_id='${req.params.id}'`
    );
    if (!deleteResponse.affectedRows) {
      errorMessage.message = "Deletion not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = deleteResponse;
    successMessage.message = "Deletion successful";
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.message = "Deletion not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const icd = {
  search,
  addFavorite,
  deleteFavorite,
};

module.exports = icd;
