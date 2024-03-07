const express = require("express");
const router = express.Router();

const adminController = require("../app/controllers/AdminController");

router.get("/order", adminController.order);
router.get("/warranty/create", adminController.createWarranty);
router.post("/wanrranty/show", adminController.showWarranty);
router.get("/product/detail", adminController.detail);
router.get("/product/addProduct", adminController.addPro);
router.get("/product", adminController.product);
router.get("/", adminController.index);

module.exports = router;
