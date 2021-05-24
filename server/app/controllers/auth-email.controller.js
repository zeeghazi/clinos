/** * Documentation:

 * To make this token a one-time-use token, I encourage you to
 * use the patient’s current password hash in conjunction with
 * the patient’s created date (in ticks) as the secret key to
 * generate the JWT. This helps to ensure that if the patient’s
 * password was the target of a previous attack (on an unrelated website),
 * then the patient’s created date will make the secret key unique
 * from the potentially leaked password.

 * With the combination of the patient’s password hash and created date,
 * the JWT will become a one-time-use token, because once the patient
 * has changed their password, it will generate a new password hash
 * invalidating the secret key that references the old password
 * Reference: https://www.smashingmagazine.com/2017/11/safe-password-resets-with-json-web-tokens/
 * */

const jwt = require("jsonwebtoken");
const moment = require("moment");
const { validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");
const { configuration, makeDb } = require("../db/db.js");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { errorMessage, successMessage, status } = require("../helpers/status");
const {
  transporter,
  getEmailVerificationURL,
  signUpConfirmationTemplate,
} = require("../helpers/email");

/**
 * `secret` is passwordHash concatenated with user's created,
 * so if someones gets a user token they still need a timestamp to intercept.
 * @param {object} user
 * @returns {string} token
 */
const usePasswordHashToMakeToken = (user) => {
  const passwordHash = user.password;
  const userId = user.id;
  const secret = `${passwordHash}-${user.created}`;
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  });
  return token;
};

/**
 * Check confirmation token and validate user
 * @param {object} req
 * @param {object} res
 * @returns {object} response
 */
exports.verifyConfirmation = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }

  const db = makeDb(configuration, res);
  try {
    // Check if user is already verified
    const userRows = await db.query(
      "SELECT id, token, email_confirm_dt FROM user WHERE id = ?",
      [req.params.userId]
    );

    const user = userRows[0];
    if (user) {
      // Check if user is already confirmed his/her email
      if (user.email_confirm_dt && !user.token) {
        successMessage.message = "User is already verified!";
        successMessage.data = user;
        return res.status(status.success).send(successMessage);
      }
      // update email_confirm_dt if it's null and remove token
      const now = moment().format("YYYY-MM-DD HH:mm:ss");
      await db.query(
        `UPDATE user SET email_confirm_dt='${now}', token=null, updated= now() WHERE id = ?`,
        [req.params.userId]
      );

      user.email_confirm_dt = now;
      successMessage.data = user;
      successMessage.message = "Your Email address successfully verified!";
      return res.status(status.success).send(successMessage);
    }
    // Couldn't find the record
    errorMessage.message =
      "Couldn't find the record. Validation link might be broken. Check your email address";
    return res.status(status.notfound).send(errorMessage);
  } catch (error) {
    // handle the error
    errorMessage.message = error;
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

/**
 * Send signup confirmation email
 * @param {object} req
 * @param {object} res
 * @returns {object} response
 */
exports.sendSignupConfirmationEmail = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }
  const db = makeDb(configuration, res);
  const rows = await db.query(
    "SELECT id, client_id, firstName, lastName, email, password, created FROM user WHERE email = ?",
    [req.body.email]
  );

  if (rows.length < 1) {
    errorMessage.message =
      "We couldn't find any record with that email address.";
    return res.status(status.notfound).send(errorMessage);
  }

  const user = rows[0];
  const accesstToken = usePasswordHashToMakeToken(user);
  const url = getEmailVerificationURL(user, accesstToken);
  const emailTemplate = signUpConfirmationTemplate(user, url);

  // update token field on that user table
  await db.query(
    `UPDATE user SET token=?, updated= now() WHERE id =?`, [accesstToken, user.id]
  );

  // send mail with defined transport object
  const info = await transporter.sendMail(emailTemplate);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  successMessage.message = ("Message sent: %s", info.messageId);
  return res.status(status.success).send(successMessage);
};

/**
 * Resend signup confirmation email
 * Based upon user id check for existing token from database if exists then send it will appropiate link or create new one
 * Send email
 * @param {object} req
 * @param {object} res
 * @returns {object} response
 */
exports.resendSignupConfirmationEmail = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage.message = errors.array();
    return res.status(status.error).send(errorMessage);
  }

  const db = makeDb(configuration, res);

  // Check where user already signed up or not
  const userRows = await db.query(
    "SELECT id, email, firstname, lastname, token, email_confirm_dt, created FROM user WHERE id = ?",
    [req.body.id]
  );
  if (userRows.length < 1) {
    errorMessage.message =
      "We couldn't find any record with that email address.";
    return res.status(status.notfound).send(errorMessage);
  }

  const user = userRows[0];
  let accesstToken;
  if (user.token) {
    accesstToken = user.token;
  } else {
    accesstToken = usePasswordHashToMakeToken(user);
    // update token field on that user table
    await db.query(
      `UPDATE user SET token=?, updated= now() WHERE id =?`, [accesstToken, user.id]
    );
  }
  const url = getEmailVerificationURL(user, accesstToken);
  const emailTemplate = signUpConfirmationTemplate(user, url);
  // send mail with defined transport object
  const info = await transporter.sendMail(emailTemplate);
  if (info) {
    console.info("Email sent:", info);
  }

  successMessage.message =
    "We have email verification link on your email address!";
  return res.status(status.success).send(successMessage);
};
