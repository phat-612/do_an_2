const Category = require("../models/Category");
const Product = require("../models/Product");
const Banner = require("../models/Banner");
const Message = require("../models/Messages");

const User = require("../models/User");
const axios = require("axios");
const {
  getDiscount,
  getDataPagination,
  findSimilarProduct,
  findFinalIdCategory,
} = require("../../util/function");
const {
  mongooseToObject,
  multipleMongooseToObject,
} = require("../../util/mongoose");

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
            .sort({ isBusiness: -1, view: -1 })
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
          Promise.all([
            Product.find(
              {
                isBusiness: true,
                "discount.endDay": { $gte: new Date() },
                "discount.startDay": { $lte: new Date() },
                "discount.percent": { $gt: 0 },
              },
              {
                name: 1,
                slug: 1,
                images: 1,
                variations: 1,
                reviews: 1,
                isBusiness: 1,
                discount: 1,
              }
            ).limit(10),
            Banner.find({ status: true }),
          ]).then(([saleProducts, banners]) => {
            saleProducts = saleProducts.map((product) => ({
              ...product.toObject(),
              variation: product.variations[0],
            }));

            res.render("user/sites/home", {
              title: "Trang chủ",
              js: "user/home",
              categories: data,
              saleProducts: saleProducts,
              banners: banners,
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
    res.render("user/sites/login", {
      layout: "mainWithoutFooter",
      title: "Đăng nhập",
    });
  }
  signUp(req, res, next) {
    res.render("user/sites/signUp", {
      layout: "mainWithoutFooter",
      title: "Đăng ký",
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
    let promiseCategory;
    if (req.params[0]) {
      slugCategory = req.params[0].split("/").filter((slug) => slug != "");
      promiseCategory = findFinalIdCategory(
        Category,
        slugCategory,
        slugRootCategory
      );
    } else {
      promiseCategory = findFinalIdCategory(Category, [], slugRootCategory);
    }
    promiseCategory
      .then((idCategory) => {
        if (!idCategory) {
          throw new Error("Category not found");
        }
        return Category.findOne({ _id: idCategory });
      })
      .then((category) => {
        if (!category || category == null) {
          return next();
        }
        const curCategory = category.toObject();
        const page =
          (parseInt(req.query.page) || 1) <= 0
            ? 1
            : parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        let sortAndFilter = [
          {
            $sort: {
              isBusiness: -1,
            },
          },
        ];
        if (
          req.query.hasOwnProperty("startPrice") &&
          req.query.hasOwnProperty("endPrice")
        ) {
          let startPrice = parseInt(req.query.startPrice);
          let endPrice = parseInt(req.query.endPrice);
          sortAndFilter.push({
            $match: {
              "variations.price": {
                $gte: startPrice,
                $lte: endPrice,
              },
            },
          });
        }
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
            // get max price and min price
            let maxPrice = Math.max(
              ...dataPagi.map((product) => product.variations.price)
            );
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
              title: `${curCategory.name}`,
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
              maxPrice,
              startPrice: req.query.startPrice || 0,
              endPrice: req.query.endPrice || maxPrice,
            });
          });
        });
      })
      .catch((error) => {
        next();
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
      .populate("comments.idUser", "name")
      .populate("comments.answers.idUser", "name")
      .then((product) => {
        if (!product || product == null) {
          return next();
        }
        // kiểm tra đăng nhập, thêm lịch sử xem sản phẩm
        if (req.session.idUser) {
          User.findOne({ _id: req.session.idUser }).then((user) => {
            if (!user.historyViews) {
              user.historyViews = [];
            }
            if (!user.historyViews.includes(product._id)) {
              user.historyViews.unshift(product._id);
            } else {
              user.historyViews = user.historyViews.pull(product._id);
              user.historyViews.unshift(product._id);
            }
            if (user.historyViews.length > 20) {
              user.historyViews.pop();
            }
            user.save();
          });
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
          idVariation: curVariation._id,
          slug: product.slug,
          curVariation,
          attribute,
          description: product.description,
          images: product.images,
          discount,
          reviews: product.reviews || [],
          comments:
            product.comments.sort(
              (a, b) => new Date(b.time) - new Date(a.time)
            ) || [],
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
        resProduct.reviews = resProduct.reviews.filter(
          (review) => review.status
        );
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

        Promise.all([
          axios.get(
            `${process.env.HOST_SYSTEM_RECOMMENDATION}/api/get_product_content_based?id_variation=${curVariation._id}`
          ),
          axios.get(
            `${process.env.HOST_SYSTEM_RECOMMENDATION}/api/get_product_collaborative_user?product_id=${product._id}`
          ),
        ])
          .then(([resCB, resCU]) => {
            let idsVariation = resCB.data.variation_ids;
            let idProducts = resCU.data.product_ids;
            return Promise.all([
              Product.find({ "variations._id": { $in: idsVariation } }),
              Product.find({ _id: { $in: idProducts } }),
            ]);
          })
          .then(([relatedProducts, togrtherProducts]) => {
            res.render("user/products/detail", {
              title: resProduct.name,
              product: resProduct,
              js: "user/detailProduct",
              togrtherProducts: togrtherProducts.map((product) => ({
                ...product.toObject(),
                variation: product.variations[0],
              })),
              relatedProducts: relatedProducts.map((product) => ({
                ...product.toObject(),
                variation: product.variations[0],
              })),
            });
          });
      });
  }
  search(req, res, next) {
    const url = req.url;
    const page =
      (parseInt(req.query.page) || 1) <= 0 ? 1 : parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    let sortAndFilter = [
      {
        $sort: {
          isBusiness: -1,
        },
      },
    ];
    if (req.query.hasOwnProperty("_find")) {
      let searchQuery = req.query.q;
      let words = [" "];
      if (searchQuery != "" && searchQuery != null) {
        words = searchQuery.split(" ");
      }
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
        title: `Tìm kiếm: ${req.query.q}`,
        products,
        keySearch: req.query.q,
        countProduct: countChild,
        currentPage,
        totalPage,
        url,
      });
    });
  }

  chatBoxUser(req, res) {
    const idRoom = req.session.idUser;
    const timeChatUser = findOne({ sender: idRoom }).then(
      (time) => time.timestamp
    );
    return res.render("user/chatbox/chatboxUser", {
      layout: "main",
      title: "Chatbox",
      js: "user/chatBoxUser",
      idRoom: idRoom,
    });
  }
  testSeeBody(req, res, next) {
    res.render("test");
  }
}
module.exports = new SiteController();
