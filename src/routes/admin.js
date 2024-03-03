const express = require("express");
const router = express.Router();

const adminController = require("../app/controllers/AdminController");

router.get("/product/detail", adminController.detail);
router.get("/product", adminController.product);
router.get("/", adminController.index);

module.exports = router;
