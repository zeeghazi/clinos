const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getPrescription = async (req, res) => {
  const db = makeDb(configuration, res);
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }

  let $sql;
  try {
    $sql = `select pd.created, d.name
    , concat(ds.strength, ds.unit) strength
    , case when ds.form='T' then 'Tablets' end form
    from patient_drug pd
    join drug d on d.id=pd.drug_id
    join drug_strength ds on ds.id=pd.drug_strength_id
    where pd.patient_id=${patient_id}
    order by pd.created desc
    limit 100`;

    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("error:", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const Prescription = {
  getPrescription,
};

module.exports = Prescription;
