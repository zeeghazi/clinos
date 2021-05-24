const express = require("express");
const { authJwt } = require("../../middlewares");
const allergyController = require("../../controllers/patient/concierge-invoice.controller");

const router = express.Router();

router.get(
  "/client-portal/invoices",
  [authJwt.verifyToken],
  allergyController.getConciergeInvoice
);

module.exports = router;
