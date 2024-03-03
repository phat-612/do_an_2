const express = require("express");
const router = express.Router();

const apiController = require("../app/controllers/ApiController");

router.post("/storeColor", apiController.storeColor);
module.exports = router;
