const express = require("express");
const controller = require("../controllers/login.controller");
const fieldValidation = require("../helpers/fieldValidation");

const router = express.Router();

// auth Routes
router.post(
  "/auth/login",
  fieldValidation.validate("login"),
  controller.signin
);

module.exports = router;
