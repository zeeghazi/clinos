const express = require("express");
const controller = require("../controllers/password-reset.controller");
const fieldValidation = require("../helpers/fieldValidation");

const router = express.Router();

// Reset password email
router.post(
  "/auth/reset_password/user/:email",
  fieldValidation.validate("resetPassword"),
  controller.sendPasswordResetEmail
);

// Forget password reset
router.post(
  "/auth/reset/:userId/:token",
  fieldValidation.validate("resetPasswordNew"),
  controller.receiveNewPassword
);

module.exports = router;
