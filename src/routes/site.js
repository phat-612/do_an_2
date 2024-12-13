const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const {
  isLoggedIn,
  userLogin,
  adminLogin,
} = require("../app/middlewares/authMiddleware");

router.get("/login", isLoggedIn, siteController.login);
router.get("/signUp", isLoggedIn, siteController.signUp);
router.get("/logout", siteController.logout);
router.get("/search", siteController.search);
router.get("/product/:slugProduct/:slugVariation?", siteController.product);
router.get("/:slugCategory", siteController.category);
router.get("/:slugCategory/*?", siteController.category);
router.get("/test", siteController.testSeeBody);
router.get("/chat", siteController.chatBoxUser);
router.get("/", siteController.index);

module.exports = router;
