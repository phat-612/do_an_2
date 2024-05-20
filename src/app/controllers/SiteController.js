const Category = require("../models/Category");
const Product = require("../models/Product");
const Banner = require("../models/Banner");
const { getDiscount, getDataPagination } = require("../../util/function");

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
            .sort({ view: -1 })
            .limit(10)
            .then((products) => {
              products = products.map((product) => ({
                ...product.toObject(),
                variation: product.variations[0],
              }));
              return {
                ...category,
                products,
              };
            });
        });
      });
      Promise.all(promises)
        .then((data) => {
          Banner.find({ status: true }).then((banners) => {
            // return res.send({
            //   categories: data,
            //   banners: banners.map((banner) => banner.toObject()),
            // });
            res.render("user/sites/home", {
              js: "user/home",
              categories: data,
              banners: banners.map((banner) => banner.toObject()),
            });
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
    const url = req.url;
    const rootCategory = req.params.slugCategory;
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
            .paginate(req),
          Product.find({
            idCategory: {
              $in: ids,
            },
          }).findable(req),
        ]).then(([categories, products, dataPagi]) => {
          let [currentPage, totalPage, countChild] = getDataPagination(
            dataPagi,
            req
          );
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
            currentPage,
            totalPage,
            url,
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

    Product.findOne({ slug: slugProduct }).then((product) => {
      if (!product || product == null) {
        return next();
      }
      Product.updateOne({ slug: slugProduct }, { $inc: { view: 1 } }).exec();
      let curVariationSlug = slugVariation
        ? slugVariation
        : product.variations[0].slug;
      let curVariation = product.variations.find(
        (variation) => variation.slug === curVariationSlug
      );

      let attribute = curVariation.attributes;
      let discount = getDiscount(product.discount);
      let resProduct = {
        name: product.name,
        price: curVariation.price,
        slug: product.slug,
        curVariation,
        attribute,
        description: product.description,
        images: product.images,
        discount,
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
      // return res.json(resProduct);
      // thêm dữ liệu vào cookie để mua ngay
      let dataBuyNow = {
        idVariation: curVariation._id,
        quantity: 1,
      };
      res.cookie("cart", JSON.stringify([dataBuyNow]), {
        maxAge: 1000 * 60 * 60 * 24,
        path: "/me",
      });
      res.render("user/products/detail", {
        product: resProduct,
      });
    });
  }
  search(req, res, next) {
    const url = req.url;
    Promise.all([
      Product.find({}).findable(req).paginate(req).exec(),
      Product.find({}).findable(req).exec(),
    ]).then(([products, dataPagi]) => {
      let [currentPage, totalPage, countChild] = getDataPagination(
        dataPagi,
        req
      );
      return res.render("user/products/search", {
        products: products.map((product) => product.toObject()),
        countProduct: countChild,
        currentPage,
        totalPage,
        url,
      });
    });
  }
}
module.exports = new SiteController();
