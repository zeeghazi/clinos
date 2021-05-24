const express = require("express");
const { authJwt } = require("../middlewares");
const Integrations = require("../controllers/integrations.controller.js");

const router = express.Router();

router.get(
  "/integrations",
  [authJwt.verifyToken],
  Integrations.getIntegrations
);
router.put("/integrations/", [authJwt.verifyToken], Integrations.update);

module.exports = router;
