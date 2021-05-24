const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getResult = async (req, res) => {
  const db = makeDb(configuration, res);
  console.log("req.body", req.body);

  const { query } = req.query;
  let $sql;
  try {
    $sql = `select id, firstname, middlename, lastname, email
    from patient
    where client_id=${req.client_id}
    and (firstname like '${query}%' or lastname like '${query}%')
    order by firstname, middlename, lastname
    limit 10`;

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

const Search = {
  getResult,
};

module.exports = Search;
