const express = require("express");
const { authJwt } = require("../middlewares");
const ProcessLab = require("../controllers/process-lab.controller.js");

const router = express.Router();

router.get("/labs", [authJwt.verifyToken], ProcessLab.getAll);
router.get("/labs/:labId", [authJwt.verifyToken], ProcessLab.getLabById);
router.get("/lab/assign-user", [authJwt.verifyToken], ProcessLab.getAssignUser);
router.get(
  "/labs/:labId/values",
  [authJwt.verifyToken],
  ProcessLab.getLabValues
);
router.get(
  "/labs/:labId/history",
  [authJwt.verifyToken],
  ProcessLab.getLabHistory
);
router.get(
  "/labs/:labId/user-history/",
  [authJwt.verifyToken],
  ProcessLab.getLabUserHistory
);
router.post("/labs", [authJwt.verifyToken], ProcessLab.createLab);
router.put("/labs/:labId", [authJwt.verifyToken], ProcessLab.updateLabStatus);
router.put("/labs/:labId/update", [authJwt.verifyToken], ProcessLab.updateLab);

module.exports = router;
