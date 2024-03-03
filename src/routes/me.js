const express = require("express");
const router = express.Router();

const meController = require("../app/controllers/MeController");

router.get("/", meController.profile);

module.exports = router;
