const express = require("express");
const { authJwt } = require("../../middlewares");
const encountersController = require("../../controllers/patient/appointment.controller");

const router = express.Router();

router.get(
  "/client-portal/practitioners",
  [authJwt.verifyToken],
  encountersController.getAllPractitioner
);

router.get(
  "/client-portal/practitioner-dates",
  [authJwt.verifyToken],
  encountersController.getPractitionerDates
);

router.get(
  "/client-portal/booked-appointments",
  [authJwt.verifyToken],
  encountersController.getBookedAppointments
);

router.post(
  "/client-portal/appointment-types",
  [authJwt.verifyToken],
  encountersController.getAppointmentTypes
);

router.post(
  "/client-portal/appointment",
  [authJwt.verifyToken],
  encountersController.createAppointment
);
router.put(
  "/client-portal/appointment/:id",
  [authJwt.verifyToken],
  encountersController.updateAppointment
);

module.exports = router;
