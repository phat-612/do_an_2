const express = require("express");
const router = express.Router();

const apiController = require("../app/controllers/ApiController");
// account
router.post("/signUp", apiController.signUp);
router.post("/login", apiController.login);
router.post("/forgotPassword", apiController.forgotPassword);
router.get("/activatePassword", apiController.activatePassword);
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
router.get("/createPaymentUrl", apiController.creatPaymentUrl);
router.get("/returnPayment", apiController.returnPayment);
router.post("/rePayment", apiController.rePayment);
// rating
router.post("/ratingProduct", apiController.ratingProduct);
// comment
router.post("/commentProduct", apiController.commentProduct);
router.post("/answerComment", apiController.answerComment);
router.get("/meMessages/:id", apiController.meMessages);
// chat
router.get("/informessage/:id", apiController.inforMessage);

module.exports = router;
