const Stripe = require("stripe");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { configuration, makeDb } = require("../../db/db.js");
const {
  errorMessage,
  successMessage,
  status,
} = require("../../helpers/status");

exports.getClientByCode = async (req, res) => {
  const db = makeDb(configuration, res);
  const { c } = req.query;
  try {
    const dbResponse = await db.query(
      `select id client_id, name, code from client where code='${c}'`
    );
    console.log("dbResponse", dbResponse);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    if (dbResponse.length === 0) {
      errorMessage.message = "Something went wrong with your URL!";
      return res.status(status.bad).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

/**
 * This function let client and user to signup into the system.
 * @param {object} req
 * @param {object} res
 * @returns {object} response
 */
exports.patientSignup = async (req, res) => {
  const db = makeDb(configuration, res);
  const { patient } = req.body;
  patient.dob = moment(patient.dob).format("YYYY-MM-DD");
  patient.created = new Date();

  patient.password = bcrypt.hashSync(patient.password, 8);

  const signature = patient.imgBase64;

  delete patient.imgBase64;

  const existingPatientRows = await db.query(
    `SELECT 1 FROM patient WHERE client_id='${patient.client_id}' and  (email='${patient.email}' or ssn='${patient.ssn}') LIMIT 1`
  );

  if (existingPatientRows.length > 0) {
    errorMessage.message = [
      {
        value: JSON.stringify(patient),
        msg: "Patient is already in our system. Try with different values",
        param: "patient.body",
      },
    ];
    return res.status(status.bad).send(errorMessage);
  }

  const $sql = `select id, name, stripe_api_key from client where id=${patient.client_id}`;

  const getStripeResponse = await db.query($sql);

  const stripe = Stripe(getStripeResponse[0].stripe_api_key);
  // Create customer on stripe.com
  const customer = await stripe.customers.create({
    email: patient.email,
    name: patient.firstname + patient.lastname,
    address: {
      city: patient.city,
      country: patient.country,
      line1: patient.address,
      line2: patient.address2,
      postal_code: patient.postal,
      state: patient.state,
    },
  });

  patient.stripe_customer_id = customer.id;
  try {
    const patientResponse = await db.query(
      "INSERT INTO patient set ?",
      patient
    );

    if (!patientResponse.insertId) {
      errorMessage.message = "patient Cannot be registered";
      res.status(status.notfound).send(errorMessage);
    }

    if (patientResponse.insertId) {
      // TODO:: Check signature and upload
      if (signature) {
        const base64Data = signature.replace(/^data:image\/png;base64,/, "");
        const dest =
          `${process.env.UPLOAD_DIR}/signature/` +
          `signature_${patientResponse.insertId}.png`;

        // eslint-disable-next-line prefer-arrow-callback
        fs.writeFile(dest, base64Data, "base64", async function (err) {
          if (err) {
            errorMessage.message = err.message;
            return res.status(status.error).send(errorMessage);
          }
          if (!err) {
            const newDb = makeDb(configuration, res);
            const updateResponse = await newDb.query(
              `update patient
                  set signature='${dest}'
                  where id=${patientResponse.insertId}
                `
            );
            if (!updateResponse.affectedRows) {
              console.error("There was a problem to save signature");
            }
          }
        });
      }
      successMessage.message = "User succesfullly registered!";
      successMessage.data = patientResponse;
      res.status(status.created).send(successMessage);
    }
  } catch (err) {
    // handle the error
    errorMessage.message = err.message;
    res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

exports.getClientForm = async (req, res) => {
  const db = makeDb(configuration, res);
  const { clientId } = req.params;
  try {
    const dbResponse = await db.query(
      `select cf.id, cf.form from client_form cf where cf.client_id=${clientId} and type='S'`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};
