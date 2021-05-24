const express = require("express");
const { authJwt } = require("../middlewares");
const CPTcodes = require("../controllers/cpt.controller");

const router = express.Router();

router.get("/cpt", [authJwt.verifyToken], CPTcodes.getLabCompnayList);
router.post("/cpt/search", [authJwt.verifyToken], CPTcodes.search);
router.post(
  "/cpt/:id/:userId",
  [authJwt.verifyToken],
  CPTcodes.updateClientCpt
);

module.exports = router;
