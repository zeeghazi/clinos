const express = require("express");
const { authJwt } = require("../../middlewares");
const indexController = require("../../controllers/corporate/index.controller");

const router = express.Router();

router.post(
  "/corporate/supports",
  [authJwt.verifyToken],
  indexController.getSupports
);

module.exports = router;
