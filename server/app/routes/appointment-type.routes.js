const express = require("express");
const { authJwt } = require("../middlewares");
const AppointmentTypes = require("../controllers/appointment-type.controller.js");
const fieldValidation = require("../helpers/fieldValidation");

const router = express.Router();

router.get(
  "/appointment-types",
  [authJwt.verifyToken],
  AppointmentTypes.getAll
);
router.post(
  "/appointment-types",
  [fieldValidation.validate("createAppointmentType"), authJwt.verifyToken],
  AppointmentTypes.create
);
router.put(
  "/appointment-types/:appointmentId",
  [authJwt.verifyToken],
  AppointmentTypes.update
);
router.delete(
  "/appointment-types/:id",
  [authJwt.verifyToken],
  AppointmentTypes.deleteAppointment
);

module.exports = router;
