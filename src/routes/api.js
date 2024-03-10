const express = require("express");
const router = express.Router();
const upload = require("../app/middlewares/uploadMiddleware");

const apiController = require("../app/controllers/ApiController");
router.post("/storeCategory", apiController.storeCategory);
router.post(
  "/storeWarranty",
  upload.array("images"),
  apiController.storeWarranty
);
// dành cho test
router.post("/test", apiController.test);
router.post("/testAddCategory", apiController.testAddCategory);
router.post("/testUpdateQuantity", apiController.testUpdateQuantity);
router.get("/testGetProduct", apiController.testGetProduct);

module.exports = router;
