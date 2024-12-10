const express = require("express");
const router = express.Router();

const adminController = require("../app/controllers/AdminController");

//get aassess providers (quan ly quyen user, admin)
router.get("/accessProviders", adminController.accessProviders);
router.get("/orderFromUser/:id", adminController.orderFromUser);
// get store
// router.get("/store", adminController.getStorePage);

//get category
router.get("/category", adminController.category);
// banner
router.get("/banner", adminController.banner);
// access reviews
router.get("/accessReview", adminController.accessReview);
//get order
router.get("/order", adminController.order);
router.get("/order/:id/detail", adminController.orderDetail);
router.get("/exportOrder", adminController.exportOrder);

//get warranty
router.get("/warranty/create", adminController.createWarranty);
router.get("/warranty/show", adminController.showWarranty);
router.get("/warranty/:id/deltail", adminController.detailWarranty);
router.get("/warranty/:id/edit", adminController.editWarranty);
router.get("/exportWarranty", adminController.exportWarranty);
// get product
router.get("/product/:id/detail", adminController.detail);
router.get("/product/:id/edit", adminController.editProduct);
router.get("/product/addProduct", adminController.addPro);
router.get("/product", adminController.product);
// home
router.get("/", adminController.index);

// newAddProduct
router.get("/newAddProduct", adminController.newAddProduct);
module.exports = router;
