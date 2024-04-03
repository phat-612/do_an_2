const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");

router.get("/login", siteController.login);
router.get("/signUp", siteController.signUp);
router.get("/logout", siteController.logout);
router.get("/test", siteController.test);
router.get("/:category", siteController.category);
router.get("/", siteController.index);

module.exports = router;
