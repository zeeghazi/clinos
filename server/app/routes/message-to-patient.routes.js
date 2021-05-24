const express = require("express");
const { authJwt } = require("../middlewares");
const formsController = require("../controllers/message-to-patient.controller.js");

const router = express.Router();

router.get(
  "/message/:id",
  [authJwt.verifyToken],
  formsController.getMessageById
);
router.post("/message", [authJwt.verifyToken], formsController.createMessage);
router.put(
  "/message/:id",
  [authJwt.verifyToken],
  formsController.updateMessage
);

module.exports = router;
