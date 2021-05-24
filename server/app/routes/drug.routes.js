const express = require("express");
const { authJwt } = require("../middlewares");
const Drug = require("../controllers/drug.controller.js");

const router = express.Router();

router.post("/drug", [authJwt.verifyToken], Drug.search);
router.post("/drug/:id/:userId", [authJwt.verifyToken], Drug.addFavorite);
router.delete("/drug/:id", [authJwt.verifyToken], Drug.deleteFavorite);

module.exports = router;
