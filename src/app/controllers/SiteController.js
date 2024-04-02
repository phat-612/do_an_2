const Category = require("../models/Category");
const Product = require("../models/Product");

class SiteController {
  index(req, res, next) {
    Promise.all([Category.find({ idParent: null }), Product.find({})])
      .then(([categories, products]) => {
        res.render("user/sites/index", {
          categories: categories.map((category) => category.toObject()),
          products: products.map((product) => product.toObject()),
        });
      })
      .catch(next);
    res.render("user/sites/home");
  }
  login(req, res, next) {
    res.render("user/sites/login");
  }
  signUp(req, res, next) {
    res.render("user/sites/signUp", {
      js: "user/signUp",
    });
  }
  logout(req, res, next) {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  }
}
module.exports = new SiteController();
