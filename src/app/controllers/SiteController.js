const Category = require("../models/Category");
const Product = require("../models/Product");
const Banner = require("../models/Banner");
const {
  getDiscount,
  getDataPagination,
  findSimilarProduct,
} = require("../../util/function");

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
              products = products.map((product) => {
                return {
                  ...product.toObject(),
                  variation: product.variations[0],
                };
              });
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
    let slugRootCategory = req.params.slugCategory;
    let slugCategory;
    const url = req.url;

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
      const curCategory = category.toObject();
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const skip = (page - 1) * limit;
      let sortAndFilter = [];
      if (req.query.hasOwnProperty("_find")) {
        let searchQuery = req.query.q;
        let words = searchQuery.split(" ");

        let regexWords = words.map((word) => ({
          name: { $regex: word, $options: "i" },
        }));
        sortAndFilter.push({
          $match: {
            $and: regexWords,
          },
        });
      }
      if (req.query.hasOwnProperty("_sort")) {
        let collum = req.query.column;
        let type = req.query.type;
        if (collum != "price") {
          sortAndFilter.push({
            $sort: {
              [collum]: type === "asc" ? 1 : -1,
            },
          });
        } else {
          sortAndFilter.push({
            $sort: {
              "variations.price": type === "asc" ? 1 : -1,
            },
          });
        }
      }

      Category.getArrayChidrendIds(category._id).then((ids) => {
        Promise.all([
          Category.findOne({ slug: slugRootCategory }),
          Category.getCategoryChildren(category._id),
          Product.aggregate([
            {
              $match: {
                idCategory: {
                  $in: ids,
                },
              },
            },
            { $unwind: "$variations" },
            {
              $set: {
                name: {
                  $reduce: {
                    input: { $objectToArray: "$variations.attributes" },
                    initialValue: "$name",
                    in: { $concat: ["$$value", " ", "$$this.v"] },
                  },
                },
              },
            },
            ...sortAndFilter,
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ]),
          Product.aggregate([
            {
              $match: {
                idCategory: {
                  $in: ids,
                },
              },
            },
            { $unwind: "$variations" },
            {
              $set: {
                name: {
                  $reduce: {
                    input: { $objectToArray: "$variations.attributes" },
                    initialValue: "$name",
                    in: { $concat: ["$$value", " ", "$$this.v"] },
                  },
                },
              },
            },
            ...sortAndFilter,
          ]),
        ]).then(([rootCategory, categories, products, dataPagi]) => {
          // return res.send({
          //   products,
          // });
          let [currentPage, totalPage, countChild] = getDataPagination(
            dataPagi,
            req,
            limit
          );
          const subCategories = categories.map((category) => ({
            name: category.name,
            slug: category.slug,
          }));
          products = products.map((product) => ({
            ...product,
            variation: product.variations[0],
          }));

          // return res.send({
          //   countProduct: countChild,
          //   rootCategory,
          //   products,
          //   subCategories,
          //   rootCategory,
          //   path: req.originalUrl,
          //   pathName: req._parsedUrl.pathname,
          //   currentPage,
          //   totalPage,
          //   url,
          //   categories,
          // });
          res.render("user/products/show", {
            js: "user/showProducts",
            countProduct: countChild,
            rootCategory: rootCategory,
            curCategory: curCategory,
            products,
            subCategories,
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

    Product.findOne({ slug: slugProduct })
      .populate("reviews.idUser", "name")
      .then((product) => {
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
          _id: product._id,
          name: product.name,
          price: curVariation.price,
          slug: product.slug,
          curVariation,
          attribute,
          description: product.description,
          images: product.images,
          discount,
          reviews: product.reviews,
          isBusiness: product.isBusiness,
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
                        quantity: cur.quantity,
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

        Product.findOne({ slug: slugProduct })
          .then((product) => {
            return findSimilarProduct(Product, product);
          })
          .then((products) => {
            // return res.send(resProduct);
            res.render("user/products/detail", {
              product: resProduct,
              js: "user/detailProduct",
              products: products.map((product) => ({
                ...product.toObject(),
                price: product.variations[0].price,
              })),
            });
          });
      });
  }
  search(req, res, next) {
    const url = req.url;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    let sortAndFilter = [];
    if (req.query.hasOwnProperty("_find")) {
      let searchQuery = req.query.q;
      let words = searchQuery.split(" ");

      let regexWords = words.map((word) => ({
        name: { $regex: word, $options: "i" },
      }));
      sortAndFilter.push({
        $match: {
          $and: regexWords,
        },
      });
    }
    if (req.query.hasOwnProperty("_sort")) {
      let collum = req.query.column;
      let type = req.query.type;
      if (collum != "price") {
        sortAndFilter.push({
          $sort: {
            [collum]: type === "asc" ? 1 : -1,
          },
        });
      } else {
        sortAndFilter.push({
          $sort: {
            "variations.price": type === "asc" ? 1 : -1,
          },
        });
      }
    }
    Promise.all([
      Product.aggregate([
        { $unwind: "$variations" },
        {
          $set: {
            name: {
              $reduce: {
                input: { $objectToArray: "$variations.attributes" },
                initialValue: "$name",
                in: { $concat: ["$$value", " ", "$$this.v"] },
              },
            },
          },
        },
        ...sortAndFilter,

        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]),
      Product.aggregate([
        { $unwind: "$variations" },
        {
          $set: {
            name: {
              $reduce: {
                input: { $objectToArray: "$variations.attributes" },
                initialValue: "$name",
                in: { $concat: ["$$value", " ", "$$this.v"] },
              },
            },
          },
        },
        ...sortAndFilter,
      ]),
    ]).then(([products, dataPagi]) => {
      let [currentPage, totalPage, countChild] = getDataPagination(
        dataPagi,
        req,
        limit
      );
      products = products.map((product) => ({
        ...product,
        variation: product.variations[0],
      }));
      return res.render("user/products/search", {
        products,
        keySearch: req.query.q,
        countProduct: countChild,
        currentPage,
        totalPage,
        url,
      });
    });
  }
}
module.exports = new SiteController();
