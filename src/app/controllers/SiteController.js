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
          })
            .limit(10)
            .then((products) => {
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
    let slugVariation;
    if (req.params.slugVariation) {
      slugVariation = req.params.slugVariation;
    }

    // có 2 thuộc tính
    Product.findOne({ slug: slugProduct }).then((product) => {
      if (!product || product == null) {
        return next();
      }
      let curVariationSlug = slugVariation
        ? slugVariation
        : product.variations[0].slug;
      let curVariation = product.variations.find(
        (variation) => variation.slug === curVariationSlug
      );

      let attribute = curVariation.attributes;
      let resProduct = {
        name: product.name,
        price: curVariation.price,
        slug: product.slug,
        curVariation,
        attribute,
        description: product.description,
        images: product.images,
        discount: product.discount,
      };
      let arrVariation;
      if (Object.keys(attribute).length === 1) {
        arrVariation = product.variations.reduce(
          (acc, cur) => {
            acc[cur.attributes[Object.keys(attribute)[0]]] = {
              slug: cur.slug,
              price: cur.price,
            };
            return acc;
          },
          {
            nameProperty: Object.keys(attribute)[0],
          }
        );
        arrVariation = [arrVariation];
      } else {
        arrVariation = Object.keys(resProduct.attribute).map((key) => {
          return product.variations.reduce(
            (acc, cur) => {
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
                        let tempVariation = product.variations.find((item) =>
                          Object.values(item.attributes).includes(value)
                        );
                        acc[value] = {
                          slug: tempVariation.slug,
                          price: tempVariation.price,
                        };
                      }
                    });
                  }
                });
              }
              return acc;
            },
            {
              nameProperty: "Phân loại",
            }
          );
        });
      }
      console.log(arrVariation);
      resProduct.arrVariation = arrVariation.map((obj) => {
        return Object.keys(obj)
          .sort()
          .reduce(
            (result, key) => {
              if (key !== "nameProperty") result[key] = obj[key];
              return result;
            },
            {
              nameProperty: obj.nameProperty,
            }
          );
      });
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
