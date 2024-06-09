const express = require("express");
const router = express.Router();

const apiController = require("../app/controllers/ApiController");
// account
router.post("/signUp", apiController.signUp);
router.post("/login", apiController.login);
router.post("/forgotPassword", apiController.forgotPassword);
router.get("/activatePassword", apiController.activatePassword);

module.exports = router;
