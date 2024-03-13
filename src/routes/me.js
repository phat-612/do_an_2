const express = require("express");
const router = express.Router();

const meController = require("../app/controllers/MeController");

router.get("/address", meController.address);
router.get("/history", meController.history);
router.get("/", meController.profile);

module.exports = router;
