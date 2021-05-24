const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

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

const getPageTitle = async (req, res) => {
  const { markerId } = req.params;

  const db = makeDb(configuration, res);
  try {
    const $sql = `select name
    from marker 
    where id = '${markerId}'`;

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

const getLabMarkerByLabId = async (req, res) => {
  const { patientId, labId } = req.params;

  const db = makeDb(configuration, res);
  try {
    const $sql = `select cpt_id
   from lab_marker
   where patient_id=${req.patient_id || patientId}
   and lab_id='${labId}'
   order by line_nbr
   limit 200`;

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

const getLabMarker = async (req, res) => {
  const { patientId } = req.params;

  const db = makeDb(configuration, res);
  try {
    const $sql = `select c.id, c.name from (
    select distinct lc.cpt_id
    from lab_marker lc
    where lc.patient_id=${req.patient_id || patientId}
    ) lc
    left join marker c on c.id=lc.cpt_id
    order by c.name
    limit 200`;

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

const getTestGraph = async (req, res) => {
  const { patientId, labId } = req.params;

  const db = makeDb(configuration, res);
  try {
    const $sql = `select lc.lab_id, lc.lab_dt, lc.cpt_id marker_id, lc.value, lc.range_low, lc.range_high, lc.unit, l.filename, lc.client_id
    from lab_marker lc
    left join lab l on l.id=lc.lab_id
    where lc.patient_id=${req.patient_id || patientId}
    and lc.cpt_id='${labId}'
    order by lc.lab_dt, lc.lab_id
    limit 200`;

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

const getConventionalRange = async (req, res) => {
  const { patientId, markerId } = req.params;
  const db = makeDb(configuration, res);
  try {
    const $sql = `select lc.lab_id, lc.lab_dt, lc.cpt_id marker_id, lc.value, lc.range_low, lc.range_high, lc.unit, l.filename, lc.client_id
    from lab_marker lc
    left join lab l on l.id=lc.lab_id
    where lc.patient_id=${req.patient_id || patientId}
    and lc.cpt_id='${markerId}'
    order by lc.lab_dt, lc.lab_id
    limit 200`;

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

const testReport = {
  getFunctionalRange,
  getPageTitle,
  getLabMarkerByLabId,
  getLabMarker,
  getTestGraph,
  getConventionalRange,
};

module.exports = testReport;
