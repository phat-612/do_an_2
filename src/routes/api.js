const express = require("express");
const router = express.Router();
const upload = require("../app/middlewares/uploadMiddleware");

const apiController = require("../app/controllers/ApiController");
const passport = require("passport");
// account
router.post("/signUp", apiController.signUp);
router.post("/login", apiController.login);
router.post("/address", apiController.storeAddress);
router.put("/profile", apiController.updateProfile);

// product
router.post("/storeCategory", apiController.storeCategory);
// warranty
router.post(
  "/storeWarranty",
  upload.array("images"),
  apiController.storeWarranty
);
// dành cho test
router.post("/test", apiController.test);
router.post("/testAddCategory", apiController.testAddCategory);
router.post("/testUpdateQuantity", apiController.testUpdateQuantity);
// router.get("/testGetProduct", apiController.testGetProduct);

module.exports = router;
