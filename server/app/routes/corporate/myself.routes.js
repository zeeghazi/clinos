const express = require("express");
const { authJwt } = require("../../middlewares");
const controller = require("../../controllers/corporate/myself.controller");

const router = express.Router();

router.get(
  "/corporate/myself/profile/:userId",
  [authJwt.verifyToken],
  controller.getProfile
);

router.put(
  "/corporate/myself/profile/:userId",
  [authJwt.verifyToken],
  controller.updateProfile
);

router.get(
  "/corporate/myself/forward-email/:userId",
  [authJwt.verifyToken],
  controller.getForwardEmail
);

router.get(
  "/corporate/myself/logins/:userId",
  [authJwt.verifyToken],
  controller.getLogins
);

router.get(
  "/corporate/myself/activity-history/:userId",
  [authJwt.verifyToken],
  controller.getActivityHistory
);

module.exports = router;
