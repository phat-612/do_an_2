const express = require("express");
const router = express.Router();

const adminController = require("../app/controllers/AdminController");

router.get("/category", adminController.category);
router.get("/order", adminController.order);
router.get("/warranty/create", adminController.createWarranty);
router.get("/warranty/show", adminController.showWarranty);
router.get("/warranty/:id/deltail", adminController.detailWarranty);
router.get("/warranty/:id/edit", adminController.editWarranty);
router.get("/product/detail", adminController.detail);
router.get("/product/addProduct", adminController.addPro);
router.get("/product", adminController.product);
router.get("/", adminController.index);

module.exports = router;
