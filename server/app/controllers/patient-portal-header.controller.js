const { validationResult } = require("express-validator");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getClientPortalHeader = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(`select cp.id, cp.header, cp.updated, concat(u.firstname, ' ', u.lastname) updated_user
    from client_portal cp
    left join user u on u.id=cp.updated_user_id
    where cp.id=${req.client_id}`);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const editClientPortalHeader = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }

  const db = makeDb(configuration, res);
  const client_portal = req.body;
  client_portal.header = req.body.header;
  client_portal.updated = new Date();
  client_portal.updated_user_id = req.user_id;

  try {
    const updateResponse = await db.query(
      `update client_portal set ? where id =${req.params.id}`,
      [client_portal]
    );

    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.message = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const clientPortalHeader = {
  getClientPortalHeader,
  editClientPortalHeader,
};

module.exports = clientPortalHeader;
