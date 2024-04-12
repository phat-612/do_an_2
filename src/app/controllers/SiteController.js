const Category = require("../models/Category");
const Product = require("../models/Product");

class SiteController {
  index(req, res, next) {
    Category.getCategoryChildren().then((categories) => {
      const promises = categories.map((category) => {
        return Category.getArrayChidrendIds(category._id).then((ids) => {
          return Product.find({
            idCategory: {
              $in: ids,
            },
          }).then((products) => {
            return {
              ...category,
              products,
            };
          });
        });
      });
      Promise.all(promises)
        .then((data) => {
          res.render("user/sites/home", {
            categories: data,
          });
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
    const rootCategory = req.params.slugCategory;
    // console.log(req);
    if (req.params[0]) {
      slugCategory = req.params[0]
        .split("/")
        .filter((slug) => slug != "")
        .pop();
    } else {
      slugCategory = req.params.slugCategory;
    }
    Category.findOne({ slug: slugCategory }).then((category) => {
      if (!category || category == null) {
        return next();
      }
      Category.getArrayChidrendIds(category._id).then((ids) => {
        Promise.all([
          Category.getCategoryChildren(category._id),
          Product.find({
            idCategory: {
              $in: ids,
            },
          })
            .findable(req)
            .sortable(req),
        ]).then(([categories, products]) => {
          const subCategories = categories.map((category) => ({
            name: category.name,
            slug: category.slug,
          }));
          products = products.map((product) => product.toObject());
          res.render("user/products/show", {
            js: "user/showProducts",
            products,
            subCategories,
            rootCategory,
            path: req.originalUrl,
            pathName: req._parsedUrl.pathname,
          });
        });
      });
    });
  }
  product(req, res, next) {
    const slugProduct = req.params.slugProduct;
    console.log(slugProduct);
    // if (req.params.slugVariation) {
    //   const slugVariation = req.params.slugVariation;
    //   console.log(slugVariation);
    // }

    // không truyền slugVariation, có 2 thuộc tính
    Product.findOne({ slug: slugProduct }).then((product) => {
      if (!product || product == null) {
        return next();
      }
      let resProduct = {
        name: product.name,
        price: product.variations[0].price,
        attribute: product.variations[0].attributes,
        description: product.description,
        images: product.images,
        discount: product.discount,
      };
      const arrVariation = Object.keys(resProduct.attribute).map((key) => {
        return product.variations.reduce((acc, cur) => {
          if (cur.attributes[key] === resProduct.attribute[key]) {
            Object.keys(cur.attributes).forEach((variationKey) => {
              if (variationKey !== key) {
                acc[cur.attributes[variationKey]] = {
                  slug: cur.slug,
                  price: cur.price,
                };
                const arrValueVariation = [
                  ...new Set(
                    product.variations.map(
                      (item) => item.attributes[variationKey]
                    )
                  ),
                ];
                arrValueVariation.forEach((value) => {
                  if (!acc.hasOwnProperty(value)) {
                    acc[value] = "";
                  }
                });
              } else {
              }
            });
          }
          return acc;
        }, {});
      });
      resProduct.arrVariation = arrVariation;
      console.log(resProduct);
      res.render("user/products/detail", {
        product: resProduct,
      });
    });
  }
  test(req, res, next) {
    Category.getAllProductsInCategory().then((categories) => {
      res.json(categories);
    });
  }
}
module.exports = new SiteController();
