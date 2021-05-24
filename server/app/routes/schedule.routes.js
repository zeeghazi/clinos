const express = require("express");
const { authJwt } = require("../middlewares");
const Schedule = require("../controllers/schedule.controller");

const router = express.Router();

router.get("/setup/schedule/users", [authJwt.verifyToken], Schedule.getAllUser);
router.post("/setup/schedule/search", [authJwt.verifyToken], Schedule.search);
router.post(
  "/setup/schedule",
  [authJwt.verifyToken],
  Schedule.createNewSchedule
);
router.put(
  "/setup/schedule/:id",
  [authJwt.verifyToken],
  Schedule.updateSchedule
);
router.delete(
  "/setup/schedule/:id",
  [authJwt.verifyToken],
  Schedule.deleteSchedule
);

module.exports = router;
