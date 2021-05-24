const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getUser = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const $sql = `select u.id, u.admin, u.client_id, u.firstname, u.lastname, u.email, u.sign_dt, u.email_confirm_dt, c.name, c.calendar_start_time, c.calendar_end_time 
    from user u
    left join client c on c.id=u.client_id 
    where u.id=${req.user_id}
    `;

    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    const user = dbResponse[0];
    if (user.admin) {
      user.permissions = ["ADMIN"];
    }
    user.role = "CLIENT";
    user.login_url = `/login_client`;
    successMessage.data = { user };
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getPatient = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select p.id, p.client_id, p.firstname, p.lastname, p.password, p.status, p.stripe_customer_id,
      p.corp_stripe_customer_id, client.code 
      from patient p 
      join client on p.client_id=client.id 
      where p.id=${req.user_id}
      `
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    const user = dbResponse[0];
    user.role = "PATIENT";
    user.login_url = `/login/${user.code}`;
    successMessage.data = { user };
    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log("error:", error);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getClient = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select * from client where id=${req.client_id}`
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    const client = dbResponse[0];
    successMessage.data = { client };
    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log("error:", error);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getUserContracts = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select id, client_id, user_id, filename, created
      from user_contract
      where client_id=${req.client_id}`
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

const getCorporateUser = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select id, admin, firstname, lastname, password from user where id='${req.user_id}' and client_id is null`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    const user = dbResponse[0];
    if (user.admin) {
      user.permissions = ["ADMIN"];
    }
    user.role = "CORPORATE";
    user.login_url = `/login_corp`;
    successMessage.data = { user };
    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log("error:", error);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getFunctionalRange = async (req, res) => {
  const db = makeDb(configuration, res);
  let $sql;

  try {
    $sql = `select functional_range
      from client
      where id=${req.client_id}`;

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

const updateFunctionalRange = async (req, res) => {
  const { functional_range } = req.body.data;
  const db = makeDb(configuration, res);
  try {
    const updateResponse = await db.query(
      `update client
        set functional_range='${functional_range}'
        where id=${req.client_id}
      `
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

const users = {
  getUser,
  getClient,
  getUserContracts,
  getPatient,
  getCorporateUser,
  getFunctionalRange,
  updateFunctionalRange,
};

module.exports = users;
