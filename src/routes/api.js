const express = require("express");
const router = express.Router();
const upload = require("../app/middlewares/uploadMiddleware");

const apiController = require("../app/controllers/ApiController");
const {
  adminLogin,
  userLogin,
  isLoggedIn,
} = require("../app/middlewares/authMiddleware");
const multer = require("multer");
// account
router.post("/signUp", apiController.signUp);
router.post("/login", apiController.login);
router.post("/address", isLoggedIn, apiController.storeAddress);
router.post("/cart", isLoggedIn, apiController.addItemToCart);
router.post("/order", isLoggedIn, apiController.createOrder);
router.put("/profile", isLoggedIn, apiController.updateProfile);
router.put("/password", isLoggedIn, apiController.updatePassword);
router.put("/address", isLoggedIn, apiController.updateAddress);
router.put("/cart", isLoggedIn, apiController.updateCartQuantity);
router.put("/cancelOrder", isLoggedIn, apiController.cancelOrder);
router.delete("/address", isLoggedIn, apiController.deleteAddress);
router.delete("/cart", isLoggedIn, apiController.removeItemToCart);
// order
router.put("/order/:id", isLoggedIn, apiController.changeStatus);
router.get("/createPaymentUrl", apiController.creatPaymentUrl);
router.get("/returnPayment", apiController.returnPayment);
router.post("/rePayment", isLoggedIn, apiController.rePayment);

// product
router.post("/product", upload.array("images"), apiController.createProduct);
router.post(
  "/removeProduct",
  upload.array("images"),
  apiController.removeProduct
);
router.post(
  "/updateProduct",
  upload.array("images1"),
  apiController.updateProduct
);
router.post("/ratingProduct", isLoggedIn, apiController.ratingProduct);
router.post("/accessReview", apiController.accessReview);
///////////////////phân quyền
router.put("/accessProviders/:id", apiController.changeHierarchy);
// warranty
router.post("/storeWarranty", apiController.storeWarranty);
router.delete("/warranty/:slugWarranty", apiController.deleteWarranty);
router.put("/warranty/:id", apiController.updateWarranty);
router.post("/statusWarranty/:id", apiController.statusWarranty);

//banner
router.post("/storeBanner", upload.array("image"), apiController.storeBanner);
router.put("/changeBanner/:id", apiController.changeBanner);
router.put("/editBanner/:id", upload.array("image"), apiController.editBanner);
router.delete("/deleteBanner/:id", apiController.deleteBanner);

// category
router.delete("/category/:slugCategory", apiController.deleteCategory);
router.post("/storeCategory", apiController.storeCategory);
router.put("/category/:id", apiController.updateCategory);
router.get("/searchCategory", apiController.searchCategory);

// dành cho test
router.post("/testAddProduct", apiController.testAddProduct);
router.post("/testSeeBody", upload.array("images"), apiController.testSeeBody);
router.get("/exportWarranty", apiController.exportWarranty);

module.exports = router;
