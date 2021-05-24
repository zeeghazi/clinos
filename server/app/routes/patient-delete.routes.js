const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/patient-delete.controller");

const router = express.Router();

router.delete(
  "/patient-delete/:id",
  [authJwt.verifyToken],
  controller.deletePatient
);

module.exports = router;
