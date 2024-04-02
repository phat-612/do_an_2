const express = require("express");
const router = express.Router();

const meController = require("../app/controllers/MeController");

router.get("/address", meController.address);
router.get("/changePassword", meController.changePassword);
router.get("/historyOrder", meController.historyOrder);
router.get("/detailOrder", meController.detailOrder);
router.get("/historyWaranty", meController.historyWaranty);
router.get("/detailWaranty", meController.detailWaranty);
router.get("/cart", meController.cart);
router.get("/", meController.profile);

module.exports = router;
