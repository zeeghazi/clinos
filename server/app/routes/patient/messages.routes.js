const express = require("express");
const { authJwt } = require("../../middlewares");
const messagesController = require("../../controllers/patient/messages.controller");

const router = express.Router();

router.get(
  "/client-portal/messages",
  [authJwt.verifyToken],
  messagesController.getAllMessages
);
router.get(
  "/client-portal/messages/users",
  [authJwt.verifyToken],
  messagesController.getUsers
);
router.post(
  "/client-portal/messages",
  [authJwt.verifyToken],
  messagesController.createMessage
);
router.put(
  "/client-portal/messages/:messageId",
  [authJwt.verifyToken],
  messagesController.updateMessage
);
router.delete(
  "/client-portal/messages/:messageId",
  [authJwt.verifyToken],
  messagesController.deleteMessage
);
router.get(
  "/client-portal/messages/:messageId",
  [authJwt.verifyToken],
  messagesController.getSingleMessage
);

module.exports = router;
