const Product = require("../models/Product");
const { multipleMongooseToObject } = require("../../util/mongoose");
class ProductController {
  show(req, res, next) {
    res.render("user/products/show");
  }
  detail(req, res, next) {
    res.render("user/products/detail");
  }
}
module.exports = new ProductController();
