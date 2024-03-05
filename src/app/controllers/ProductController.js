const Product = require("../models/Product");
const { multipleMongooseToObject } = require("../../util/mongoose");
class ProductController {
  show(req, res, next) {
    res.render("user/products/show", {});
  }
}
module.exports = new ProductController();
