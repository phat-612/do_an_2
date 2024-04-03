const Category = require("../models/Category");
const Product = require("../models/Product");

class SiteController {
  index(req, res, next) {
    Category.getCategoryChildren().then((categories) => {
      const promises = categories.map((category) => {
        return Category.getAllProductsInCategory(category._id).then(
          (products) => {
            return {
              ...category,
              products,
            };
          }
        );
      });
      Promise.all(promises)
        .then((data) => {
          res.render("user/sites/home", {
            categories: data,
          });
          // res.json(data);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        });
    });
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
  test(req, res, next) {
    Category.getAllProductsInCategory().then((categories) => {
      res.json(categories);
    });
  }
}
module.exports = new SiteController();
