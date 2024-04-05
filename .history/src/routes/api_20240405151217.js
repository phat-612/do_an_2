const express = require("express");
const router = express.Router();
const upload = require("../app/middlewares/uploadMiddleware");

const apiController = require("../app/controllers/ApiController");
// account
router.post("/signUp", apiController.signUp);
router.post("/login", apiController.login);
router.post("/address", apiController.storeAddress);
router.post("/cart", apiController.addItemToCart);
router.put("/profile", apiController.updateProfile);
router.put("/password", apiController.updatePassword);
router.put("/address", apiController.updateAddress);
router.delete("/address", apiController.deleteAddress);

// product
router.post("/storeCategory", apiController.storeCategory);
// warranty
router.post(
  "/storeWarranty",
  upload.array("images"),
  apiController.storeWarranty
);
router.delete("/:id/", apiController.deleteWarranty);
// dành cho test
router.post("/test", apiController.test);
router.post("/testAddCategory", apiController.testAddCategory);
router.post("/testUpdateQuantity", apiController.testUpdateQuantity);
// router.get("/testGetProduct", apiController.testGetProduct);

module.exports = router;
