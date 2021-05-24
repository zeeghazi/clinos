const express = require("express");
const { authJwt } = require("../middlewares");
const homeController = require("../controllers/home.controller.js");

const router = express.Router();

router.get(
  "/appointments/events",
  [authJwt.verifyToken],
  homeController.getAll
);
router.get(
  "/appointments/history",
  [authJwt.verifyToken],
  homeController.getAppointmentHistory
);
router.get(
  "/appointments/events/:providerId",
  [authJwt.verifyToken],
  homeController.getEventsByProvider
);
router.post(
  "/appointments/events",
  [authJwt.verifyToken],
  homeController.createAppointment
);
router.put(
  "/appointments/events/cancel/:id",
  [authJwt.verifyToken],
  homeController.cancelAppointment
);
router.put(
  "/appointments/events/update/:id",
  [authJwt.verifyToken],
  homeController.updateAppointment
);
router.get(
  "/appointment-requests/:providerId",
  [authJwt.verifyToken],
  homeController.getAppointmentRequest
);
router.get(
  "/unread-messages/:providerId",
  [authJwt.verifyToken],
  homeController.getUnreadMessages
);
router.get("/providers", [authJwt.verifyToken], homeController.getProviders);
router.get(
  "/providers-details/:providerId",
  [authJwt.verifyToken],
  homeController.getProviderDetails
);

module.exports = router;
