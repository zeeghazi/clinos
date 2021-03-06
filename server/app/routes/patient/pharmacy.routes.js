const express = require("express");
const { authJwt } = require("../../middlewares");
const pharmacyController = require("../../controllers/patient/pharmacy.controller");

const router = express.Router();

router.get(
  "/client-portal/pharmacy",
  [authJwt.verifyToken],
  pharmacyController.getPharmacy
);
router.put(
  "/client-portal/pharmacy/:id",
  [authJwt.verifyToken],
  pharmacyController.updatePharmacy
);
router.post(
  "/client-portal/pharmacy/search",
  [authJwt.verifyToken],
  pharmacyController.searchPharmacy
);

module.exports = router;
