const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

const getConciergeInvoice = async (req, res) => {
  const db = makeDb(configuration, res);

  let $sql;
  try {
    $sql = `select c.name, lc.name, lc.concierge, c.price, t.id
    from patient_cpt pc
    join cpt c on c.id=pc.cpt_id
    join lab_company lc on lc.id=c.lab_company_id
    left join tran t on t.patient_id=pc.patient_id
        and t.encounter_id=pc.encounter_id
        and t.cpt_id=pc.cpt_id
    where pc.encounter_id=1
    and lc.concierge is true`;

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

const Invoices = {
  getConciergeInvoice,
};

module.exports = Invoices;
