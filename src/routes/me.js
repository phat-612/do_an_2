const express = require("express");
const router = express.Router();

const meController = require("../app/controllers/MeController");

router.get("/address", meController.address);
router.get("/changePassword", meController.changePassword);
router.get("/historyOrder", meController.historyOrder);
router.get("/detailOrder/:idOrder", meController.detailOrder);
router.get("/historyWarranty", meController.historyWarranty);
router.get("/detailWarranty/:idWarranty", meController.detailWaranty);
router.get("/historyView", meController.historyView);
router.get("/cart", meController.cart);
router.get("/order", meController.order);
router.get("/", meController.profile);

module.exports = router;
