const fs = require("fs");
const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");
const { documentUpload, removeFile } = require("../../helpers/fileUpload");

const getAlllabs = async (req, res) => {
  const { tab } = req.query;
  let { patient_id } = req.query;

  if (typeof patient_id === "undefined") {
    patient_id = req.user_id;
  }
  const db = makeDb(configuration, res);

  let $sql;

  try {
    $sql = `select l.created, l.filename, l.status
    from lab l
    where l.patient_id=${patient_id} `;

    if (typeof tab !== "undefined" && tab !== "All") {
      if (tab === "Lab") {
        $sql += `and l.type='l' `;
      } else if (tab === "Imaging") {
        $sql += `and l.type='I' `;
      } else if (tab === "Misc") {
        $sql += `and l.type='M' `;
      } else if (tab === "Uncategorized") {
        $sql += `and l.type is null `;
      }
    }

    $sql += `order by l.created desc limit 200`;

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

const createLabs = async (req, res) => {
  documentUpload(req, res, async (err) => {
    if (err) {
      errorMessage.message = err.message;
      return res.status(status.error).send(errorMessage);
    }
    if (!req.file) {
      errorMessage.message = "File content can not be empty!";
      return res.status(status.error).send(errorMessage);
    }

    let { patient_id } = req.query;
    const uploadedFilename = req.file.originalname;

    if (typeof patient_id === "undefined") {
      patient_id = req.user_id;
    }

    const db = makeDb(configuration, res);
    try {
      const existingLabDocument = await db.query(
        `select 1
        from lab
        where patient_id=${patient_id}
        and filename='${uploadedFilename}'
        limit 1`
      );
      if (existingLabDocument.length > 0) {
        removeFile(req.file);
        errorMessage.message = "Same file is already in our database system!";
        return res.status(status.error).send(errorMessage);
      }

      const insertResponse = await db.query(
        `insert into lab (client_id, user_id, patient_id, filename, status, source, created, created_user_id) values (${req.client_id}, ${req.user_id}, ${patient_id}, '${uploadedFilename}', 'R', 'P', now(), ${req.user_id})`
      );

      if (!insertResponse.affectedRows) {
        removeFile(req.file);
        errorMessage.message = "Insert not successful";
        return res.status(status.notfound).send(errorMessage);
      }

      // It's limitation of Multer to pass variable to use as filename.
      fs.renameSync(
        req.file.path,
        req.file.path.replace("undefined", patient_id)
      );

      successMessage.data = insertResponse;
      successMessage.message = "Insert successful";
      return res.status(status.created).send(successMessage);
    } catch (excepErr) {
      errorMessage.message = "Insert not successful";
      return res.status(status.error).send(errorMessage);
    } finally {
      await db.close();
    }
  });
};

const Labs = {
  getAlllabs,
  createLabs,
};

module.exports = Labs;
