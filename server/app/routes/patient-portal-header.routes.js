const express = require("express");
const { authJwt } = require("../middlewares");
const ClientPortalHeader = require("../controllers/patient-portal-header.controller");

const router = express.Router();

router.get(
  "/patient-portal-header",
  [authJwt.verifyToken],
  ClientPortalHeader.getClientPortalHeader
);
router.put(
  "/patient-portal-header/:id",
  [authJwt.verifyToken],
  ClientPortalHeader.editClientPortalHeader
);

module.exports = router;
