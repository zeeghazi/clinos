const express = require("express");
const { authJwt } = require("../../middlewares");
const lanbsController = require("../../controllers/patient/labs.controller");

const router = express.Router();

router.get(
  "/client-portal/labs",
  [authJwt.verifyToken],
  lanbsController.getAlllabs
);

router.post(
  "/client-portal/labs",
  [authJwt.verifyToken],
  lanbsController.createLabs
);

module.exports = router;
