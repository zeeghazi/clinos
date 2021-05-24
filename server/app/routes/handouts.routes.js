const express = require("express");
const { authJwt } = require("../middlewares");
const handouts = require("../controllers/handouts.controller.js");

const router = express.Router();

router.get("/handouts", [authJwt.verifyToken], handouts.getAll);
router.post("/handouts", [authJwt.verifyToken], handouts.addHandouts);
router.delete("/handouts/:id", [authJwt.verifyToken], handouts.deleteHandout);

module.exports = router;
