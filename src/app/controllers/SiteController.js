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
  category(req, res, next) {
    let slugCategory;
    if (req.params[0]) {
      slugCategory = req.params[0]
        .split("/")
        .filter((slug) => slug != "")
        .pop();
    } else {
      slugCategory = req.params.slugCategory;
    }
    Category.findOne({ slug: slugCategory }).then((category) => {
      if (!category) {
        next();
      }
      Category.getCategoryChildren(category._id).then((categories) => {
        const subCategories = categories.map((category) => ({
          name: category.name,
          slug: category.slug,
        }));
        res.render("user/products/show");
      });
    });
  }
  product(req, res, next) {
    const slugProduct = req.params.slugProduct;
    res.render("user/products/detail");
  }
  test(req, res, next) {
    Category.getAllProductsInCategory().then((categories) => {
      res.json(categories);
    });
  }
}
module.exports = new SiteController();
