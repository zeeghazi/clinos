const { validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const { errorMessage, successMessage, status } = require("../helpers/status");
const { configuration, makeDb } = require("../db/db.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("req:", req.body);
    const dest = `${process.env.UPLOAD_DIR}/client`;
    // eslint-disable-next-line prefer-arrow-callback
    fs.access(dest, function (error) {
      if (error) {
        console.log("Directory does not exist.");
        return fs.mkdir(dest, (err) => cb(err, dest));
      }
      console.log("Directory exists.");
      return cb(null, dest);
    });
  },
  filename: (req, file, cb) => {
    const fileName = `c${req.params.userId}_logo.png`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Allowed only image"));
    }
  },
});

const getInit = async (req, res) => {
  const db = makeDb(configuration, res);
  let $sql;

  try {
    $sql = `select id, name, code, address, address2, city, state, postal, country, phone, fax, website, email, ein, npi, calendar_start_time, calendar_end_time
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

const getHistory = async (req, res) => {
  const db = makeDb(configuration, res);
  let $sql;

  try {
    $sql = `select 
      ch.created
      ,ch.name
      ,ch.code
      ,ch.address
      ,ch.address2
      ,ch.city
      ,ch.state
      ,ch.postal
      ,ch.country
      ,ch.phone
      ,ch.fax
      ,ch.email
      ,ch.website
      ,ch.calendar_start_time
      ,ch.calendar_end_time
      ,ch.functional_range
      ,ch.ein
      ,ch.npi
      ,ch.concierge_lab_ordering
      from client_history ch
      where ch.id=${req.client_id}
      order by ch.created desc
      limit 50`;

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

const imageUpload = upload.single("file");

const logoUpdate = async (req, res) => {
  // eslint-disable-next-line prefer-arrow-callback
  imageUpload(req, res, function (err) {
    if (err) {
      console.info("documentUpload Error:", err.message);
      errorMessage.message = err.message;
      return res.status(status.error).send(errorMessage);
    }
    if (!req.file) {
      errorMessage.message = "File content can not be empty!";
      return res.status(status.error).send(errorMessage);
    }
    return res.status(status.success).send("success");
  });
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }

  const db = makeDb(configuration, res);
  const client = req.body;

  client.updated = new Date();
  client.updated_user_id = req.user_id;

  try {
    const updateResponse = await db.query(
      `update client set ? where id =${req.params.clientId}`,
      [client]
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

const Config = {
  getInit,
  getHistory,
  update,
  logoUpdate,
};

module.exports = Config;
