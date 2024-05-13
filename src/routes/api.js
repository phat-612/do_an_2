const express = require("express");
const router = express.Router();
const upload = require("../app/middlewares/uploadMiddleware");

const apiController = require("../app/controllers/ApiController");
// account
router.post("/signUp", apiController.signUp);
router.post("/login", apiController.login);
router.post("/address", apiController.storeAddress);
router.post("/cart", apiController.addItemToCart);
router.post("/order", apiController.createOrder);
router.put("/profile", apiController.updateProfile);
router.put("/password", apiController.updatePassword);
router.put("/address", apiController.updateAddress);
router.put("/cart", apiController.updateCartQuantity);
router.put("/cancelOrder", apiController.cancelOrder);
router.delete("/address", apiController.deleteAddress);
router.delete("/cart", apiController.removeItemToCart);
// order
router.put("/order/:id", apiController.changeStatus);

// product
router.post("/product", upload.array("images"), apiController.createProduct);
router.post("/storeCategory", apiController.storeCategory);
// warranty
router.post(
  "/storeWarranty",
  upload.array("images"),
  apiController.storeWarranty
);
router.delete("/warranty/:slugWarranty", apiController.deleteWarranty);
router.put("/warranty/:id", apiController.updateWarranty);
// category
router.delete("/category/:slugCategory", apiController.deleteCategory);
router.put("/category/:id", apiController.updateCategory);

// dành cho test
router.post("/test", apiController.test);
router.post("/testAddCategory", apiController.testAddCategory);
router.post("/testUpdateQuantity", apiController.testUpdateQuantity);
// router.get("/testGetProduct", apiController.testGetProduct);
router.post("/testAddOrder", apiController.testAddOrder);
router.get("/test/thanhToan", apiController.creatPaymentUrl);

module.exports = router;
