const express = require("express");
const router = express.Router();
const { upload } = require("../app/middlewares/uploadMiddleware");

const apiController = require("../app/controllers/ApiController");
// order
router.put("/order/:id", apiController.changeStatus);

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
// comment
router.post("/nextComment", apiController.nextComment);
// chat
router.get("/messages/:id", apiController.allMessages);

module.exports = router;
