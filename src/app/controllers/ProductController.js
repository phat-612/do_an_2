const Product = require("../models/Product");
const { multipleMongooseToObject } = require("../../util/mongoose");
class ProductController {
  show(req, res, next) {
    Product.findOne({ slug: req.params.slug })
      .then((Product) => {
        res.json(Product);
      })
      .catch(next);
  }
}
module.exports = new ProductController();
