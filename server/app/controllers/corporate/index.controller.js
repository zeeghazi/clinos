const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getSupports = async (req, res) => {
  const db = makeDb(configuration, res);

  const { caseStatus } = req.body.data;

  try {
    let $sql;

    $sql = `select s.id, c.name, s.created, concat(u.firstname, ' ', u.lastname) created_by, s.subject, cs.name status, s.updated
    from support s
    left join client c on c.id=s.client_id
    left join case_status cs on cs.id=s.status_id
    left join user u on u.id=s.created_user_id
    where s.client_id=1`;

    if (typeof caseStatus !== "undefined") {
      $sql += ` and s.status_id in ('WD', 'WC')`;
    }
    $sql += `order by s.created desc limit 100`;
    const rows = await db.query($sql);

    const dbResponse = rows;

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

const supports = {
  getSupports,
};

module.exports = supports;
