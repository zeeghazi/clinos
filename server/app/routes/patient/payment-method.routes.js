const express = require("express");
const { authJwt } = require("../../middlewares");
const PaymentMethodController = require("../../controllers/patient/paymentMethod.controller");

const router = express.Router();

router.get(
  "/patient-portal/payment-methods",
  [authJwt.verifyToken],
  PaymentMethodController.getPaymentMethods
);
router.post(
  "/patient-portal/payment-methods",
  [authJwt.verifyToken],
  PaymentMethodController.createPaymentMethod
);
router.put(
  "/patient-portal/payment-methods/:id",
  [authJwt.verifyToken],
  PaymentMethodController.updatePaymentMethod
);
router.delete(
  "/patient-portal/payment-methods/:id",
  [authJwt.verifyToken],
  PaymentMethodController.deletePaymentMethod
);
module.exports = router;
