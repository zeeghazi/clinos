const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getAccountingTypes = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(`select tt.id, tt.name, tt.amount, tt.note, tt.client_id, tt.status
    , c.name client_name
    , tt.created, concat(u.firstname, ' ', u.lastname) created_user
    , tt.updated, concat(u2.firstname, ' ', u2.lastname) updated_user
    from tran_type tt
    left join user u on u.id=tt.created_user_id
    left join user u2 on u2.id=tt.updated_user_id
    left join client c on c.id=tt.client_id
    where (tt.client_id is null or tt.client_id=${req.client_id})
    order by 1
    limit 100`);

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

const accountingTypes = {
  getAccountingTypes,
};
module.exports = accountingTypes;
