const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/patient-merge.controller");

const router = express.Router();

router.post("/patient-merge", [authJwt.verifyToken], controller.mergePatient);

module.exports = router;
