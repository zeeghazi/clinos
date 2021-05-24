const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getLabBilling = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  let $sql;
  try {
    $sql = `select t.id, t.dt, t.amount, t.completed_dt, left(group_concat(c.name separator ", "), 400) tests
    from tranc t
    left join tranc_detail td on td.tranc_id = t.id
    left join cpt c on c.id = td.cpt_id
    where t.patient_id = ${patient_id}
    group by t.id, t.dt, t.amount, t.completed_dt
    order by t.dt desc
    `;

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

const labBilling = {
  getLabBilling,
};

module.exports = labBilling;
