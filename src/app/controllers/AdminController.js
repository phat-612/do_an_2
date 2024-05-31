const mongoose = require("mongoose");

const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Banner = require("../models/Banner");
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require("path");

const { getDataPagination } = require("../../util/function");
const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");

class AdminController {
  // get /
  index(req, res, next) {
    Product.find({})
      .then(function (products) {
        Order.find({}).then(function (orders) {
          Promise.all([
            Order.aggregate([
              {
                $match: {
                  "paymentDetail.status": "success",
                },
              },
              {
                $group: {
                  _id: null,
                  totalAmount: {
                    $sum: "$total",
                  },
                },
              },
            ]),
            Product.aggregate([
              {
                $set: {
                  totalReviews: { $size: "$reviews" },
                },
              },
              { $sort: { totalReviews: -1 } }, // Sấp xếp
              { $limit: 4 }, // Limit to top 4 products
              {
                $project: {
                  name: 1,
                  images: 1,
                  totalReviews: 1,
                },
              },
            ]),
            Product.aggregate([
              { $unwind: "$variations" }, // Unwind the variations array
              {
                $group: {
                  _id: "$_id",
                  name: { $first: "$name" },
                  images: { $first: "$images" },
                  view: { $first: "$view" },
                  slug: { $first: "$slug" },
                  totalSold: { $sum: "$variations.sold" },
                  variations: { $push: "$variations" },
                },
              },
              { $sort: { totalSold: -1 } }, // Sort by total sold in descending order
              { $limit: 4 }, // Limit to top 4 products
            ]),
          ]).then(([doanhThu, topReviewProduct, topProducts]) => {
            doanhThu = doanhThu[0] ? doanhThu[0].totalAmount : 0;
            res.render("admin/sites/home", {
              layout: "admin",
              js: "admin/home",
              css: "admin/home",
              orders: multipleMongooseToObject(orders),
              products: multipleMongooseToObject(products),
              topProducts: topProducts,
              topReviewProduct: topReviewProduct,
              doanhThu: doanhThu,
            });
          });
        });
      })
      .catch(next);
  }
  // get /product
  product(req, res, next) {
    const url = req.originalUrl;
    const find = req.query.q;
    let match = {};
    if (find && find.trim() != "") {
      let words = find.split(" ");

      let regexWords = words.map((word) => ({
        name: { $regex: word, $options: "i" },
      }));
      match = { $and: regexWords };
    }
    Promise.all([
      Product.find(match).populate("idCategory", "name").paginate(req),
      Product.find(match),
    ]).then(([products, datapagi]) => {
      // return res.send(products);
      let [currentPage, totalPage] = getDataPagination(datapagi, req, 10);
      // return res.send({ products, datapagi });
      res.render("admin/products/showProduct", {
        layout: "admin",
        js: "admin/showProduct",
        css: "admin/showProduct",
        products: multipleMongooseToObject(products),
        currentPage,
        totalPage,
        url,
      });
    });
  }
  // get /product/addproduct
  addPro(req, res, next) {
    Category.find()
      .populate("idParent", "name")
      .then((categorys) => {
        const categoryIdParent = [];
        const categoryNotIdParent = [];

        categorys.forEach((category) => {
          if (category.idParent) {
            categoryIdParent.push(category);
          } else {
            categoryNotIdParent.push(category);
          }
        });

        const storeCategory = categoryNotIdParent.concat(categoryIdParent);
        res.render("admin/products/addProduct", {
          layout: "admin",
          js: "admin/addProduct",
          css: "admin/addProduct",
          categorys: multipleMongooseToObject(storeCategory),
        });
      });
  }
  //get /product/edit/:id
  editProduct(req, res, next) {
    Category.find().then((categorys) => {
      Product.findById(req.params.id).then((product) => {
        const productVariations = product.variations;
        const productAttrs = product.variations.map((detail) => {
          return detail.attributes;
        });
        let attributes1 = {};
        let attributes2 = {};

        productAttrs.forEach((attr) => {
          for (let key in attr) {
            let target =
              key === Object.keys(attr)[0] ? attributes1 : attributes2;
            if (!target[key]) {
              target[key] = [attr[key]];
            } else if (!target[key].includes(attr[key])) {
              target[key].push(attr[key]);
            }
          }
        });
        const attributes1Val = Object.values(attributes1).flat();
        const attributes2Val = Object.values(attributes2).flat();

        let dataVariation = {
          dataTable: [],
        };
        let arrKey = Object.keys(productVariations[0].attributes);
        arrKey.forEach((key) => {
          let arrValue = [
            ...new Set(productVariations.map((item) => item.attributes[key])),
          ];
          dataVariation[key] = arrValue;
        });
        if (arrKey.length === 1) {
          dataVariation.dataTable = productVariations;
        } else {
          dataVariation[arrKey[0]].forEach((value1) => {
            dataVariation[arrKey[1]].forEach((value2) => {
              let temp = productVariations.find(
                (item) =>
                  JSON.stringify(item.attributes) ==
                  JSON.stringify({
                    [arrKey[0]]: value1,
                    [arrKey[1]]: value2,
                  })
              );
              if (!temp) {
                dataVariation.dataTable.push({
                  price: 0,
                  quantity: 0,
                  attributes: { [arrKey[0]]: value1, [arrKey[1]]: value2 },
                  sold: 0,
                  _id: "",
                  slug: "",
                });
              } else {
                dataVariation.dataTable.push(temp);
              }
            });
          });
        }

        res.render("admin/products/editProduct", {
          product: mongooseToObject(product),
          layout: "admin",
          js: "admin/editProduct",
          css: "admin/editProduct",
          categorys: multipleMongooseToObject(categorys),
          dataVariation: dataVariation,
          attributes1: attributes1Val.reverse(),
          attributes2: attributes2Val.reverse(),
        });
      });
    });
  }
  // fat pan phước
  // return res.json({
  //   categorys: multipleMongooseToObject(categorys),
  //   attributes1: attributes1,
  //   attributes2: attributes2,
  //   variations: JSON.stringify(variations),
  // });
  // Minh Luân đã từng ghé qua
  // Product.findById(req.params.id).then((product) => {
  //   if (!product) {
  //     return res.json({ message: "Không tìm thấy sản phẩm" });
  //   }
  //   let productAttributes = product.variations.map((detail) => {
  //     return detail.attributes;
  //   });
  //   // console.log(productAttributes);
  //   let attributes = productAttributes.reduce((result, attr) => {
  //     for (let key in attr) {
  //       if (!result[key]) result[key] = [attr[key]];
  //       else if (!result[key].includes(attr[key]))
  //         result[key].push(attr[key]);
  //     }
  //     return result;
  //   }, {});
  //   res.render("admin/products/editProduct", {
  //     layout: "admin",
  //     js: "admin/editProduct",
  //     css: "admin/editProduct",
  //     product: mongooseToObject(product),
  //     productAttributes: attributes,
  //   });
  //   console.log(attributes);
  // });

  // get /product/detail
  detail(req, res, next) {
    Product.findById(req.params.id)
      .populate({
        path: "idCategory",
        populate: { path: "idParent" },
      })
      .then((product) => {
        const getAllParent = async (category) => {
          let parents = [];
          const findParent = async (inpCategory) => {
            parents.push(inpCategory);
            const parent = await Category.findOne({
              _id: inpCategory.idParent,
            });
            if (parent) {
              await findParent(parent);
            }
          };
          await findParent(category);
          return parents;
        };
        getAllParent(product.idCategory).then((parents) => {
          product = {
            ...product.toObject(),
            category: parents.map((parent) => parent.name).reverse(),
            brand: parents.length > 1 ? parents.reverse()[1].name : null,
          };
          // ===============================
          const productAttrs = product.variations.map((detail) => {
            return detail.attributes;
          });
          let attributes1 = {};
          let attributes2 = {};
          productAttrs.forEach((attr) => {
            for (let key in attr) {
              let target =
                key === Object.keys(attr)[0] ? attributes1 : attributes2;
              if (!target[key]) {
                target[key] = [attr[key]];
              } else if (!target[key].includes(attr[key])) {
                target[key].push(attr[key]);
              }
            }
          });
          res.render("admin/products/detailProduct", {
            product,
            layout: "admin",
            js: "admin/detailProduct",
            attributes1: attributes1,
            attributes2: attributes2,
          });
        });
      })
      .catch(next);
  }
  // banner
  banner(req, res) {
    Banner.find({}).then((banners) => {
      res.render("admin/sites/banner", {
        title: "Quản Lý Banner",
        layout: "admin",
        js: "admin/banner",
        css: "admin/banner",
        banners: multipleMongooseToObject(banners),
      });
    });
  }

  // get /orderproducts
  order(req, res, next) {
    const name = req.query.name; // Truy cập từ khóa tìm kiếm từ URL

    if (name) {
      // Tìm người dùng theo tên, sử dụng regex để match các đối tượng chứa chữ "a"
      User.find({ name: new RegExp(name, "i") })
        .then((users) => {
          let userIds = users.map((user) => user._id);
          return Order.find({ idUser: { $in: userIds } })
            .populate("idUser", "name")
            .paginate(req);
        })
        .then((orders) => {
          res.render("admin/orders/orderProduct", {
            layout: "admin",
            js: "admin/orderProduct",
            css: "admin/orderProduct",
            orders: multipleMongooseToObject(orders),
          });
        });
    } else {
      // Nếu không có truy vấn tìm kiếm, thì chỉ cần lấy tất cả các đơn hàng
      Order.find({})
        .populate("idUser", "name")
        .then((orders) => {
          res.render("admin/orders/orderProduct", {
            layout: "admin",
            js: "admin/orderProduct",
            css: "admin/orderProduct",
            orders: multipleMongooseToObject(orders),
          });
        });
    }
  }
  // get /order/detail
  orderDetail(req, res, next) {
    Order.findById(req.params.id)
      .populate("idUser")
      .then((order) => {
        if (!order) {
          return res.json({ message: "Không tìm thấy đơn hàng" });
        }

        let totalNotSale = order.details.reduce((accumulator, detail) => {
          return accumulator + detail.price * detail.quantity;
        }, 0);
        let promises = order.details.map((detail) => {
          return Product.findOne({ "variations._id": detail.idVariation }).then(
            (product) => {
              if (!product) {
                console.error(`Không thấy sản phẩm ${detail.idVariation}`);
                return null;
              }
              let variation = product.variations.id(detail.idVariation);
              let productName = product.name;
              let variationAttributes = variation ? variation.attributes : {};

              let detailObject = detail.toObject();
              detailObject.productName = productName;
              detailObject.variationAttributes = variationAttributes;

              let discountedPrice =
                detail.price - detail.price * (detail.discount / 100);
              detailObject.totalPrice = discountedPrice * detail.quantity;
              detailObject.originalTotalPrice = detail.price * detail.quantity;
              return detailObject;
            }
          );
        });

        Promise.all(promises).then((result) => {
          res.render("admin/orders/orderDetail", {
            layout: "admin",
            js: "admin/orderDetail",
            css: "admin/orderDetail",
            orders: result,
            order: order,
            totalNotSale: totalNotSale, //gia chua giam
          });
          // console.log(totalNotSale, totalOrder);
        });
      });
  }

  //get /category
  category(req, res, next) {
    Category.find({})
      .populate("idParent", "name")
      .then((categories) => {
        // Sắp xếp danh mục
        const categoryIdParent = [];
        const categoryNotIdParent = [];

        categories.forEach((category) => {
          if (category.idParent) {
            categoryIdParent.push(category);
          } else {
            categoryNotIdParent.push(category);
          }
        });

        const storeCategory = categoryNotIdParent.concat(categoryIdParent);
        res.render("admin/sites/category", {
          layout: "admin",
          js: "admin/category",
          css: "admin/category",
          category: multipleMongooseToObject(storeCategory),
        });
      });
  }
  //get /assessProviders
  accessProviders(req, res, next) {
    User.find({})
      .then((users) => {
        const usersData = users.map((user) => {
          return {
            id: user._id, // Hoặc dùng "_id" hoặc thuộc tính tương ứng, tùy vào đặc điểm của đối tượng 'user'
            role: user.role,
          };
        });
        // console.log(usersData);
        res.render("admin/sites/accessProviders", {
          layout: "admin",
          js: "admin/accessProviders",
          users: multipleMongooseToObject(users),
          usersData: usersData,
        });
      })
      .catch(next);
  }

  //minh luan
  async createWarranty(req, res, next) {
    const products = await Product.find({});
    res.render("admin/warrantys/create-warranty", {
      layout: "admin",
      js: "admin/createWarranty",
      products: multipleMongooseToObject(products),
    });
  }
  async showWarranty(req, res, next) {
    const warrantys = await Warranty.find({});
    res.render("admin/warrantys/show-warranty", {
      layout: "admin",
      js: "admin/showWarranty",
      warrantys: multipleMongooseToObject(warrantys),
    });
  }
  detailWarranty(req, res, next) {
    Warranty.findById(req.params.id)
      .populate("details.idProduct")
      .exec()
      .then((warranty) => {
        const productsAndReasons = [];
        warranty.details.forEach((detail) => {
          const productName =
            detail.idProduct && detail.idProduct.name
              ? detail.idProduct.name
              : null;
          const reasonsAndPrices = detail.reasonAndPrice
            ? detail.reasonAndPrice.map((reasonPrice) => ({
                reason: reasonPrice.reason,
                price: reasonPrice.price,
              }))
            : [];
          if (productName && reasonsAndPrices.length > 0) {
            productsAndReasons.push({
              productName,
              reasonsAndPrices,
            });
          }
        });

        res.render("admin/warrantys/detail-warranty", {
          layout: "admin",
          js: "admin/detailWarranty",
          warranty: mongooseToObject(warranty),
          productsAndReasons,
        });
        // console.log(product);
      });
  }
  editWarranty(req, res, next) {
    Warranty.findById(req.params.id)
      .populate("details.idProduct")
      .exec()
      .then((warranty) => {
        const productsAndReasons = [];
        warranty.details.forEach((detail) => {
          const detailId = detail._id;
          const productId = detail.idProduct ? detail.idProduct._id : null;
          const productName = detail.idProduct ? detail.idProduct.name : null;
          const reasonsAndPrices = detail.reasonAndPrice
            ? detail.reasonAndPrice.map((reasonPrice) => ({
                reason: reasonPrice.reason,
                price: reasonPrice.price,
              }))
            : [];
          if (productName && reasonsAndPrices.length > 0) {
            productsAndReasons.push({
              detailId: detailId,
              id: productId,
              productName,
              reasonsAndPrices,
            });
          }
        });
        Product.find({}).then((products) => {
          res.render("admin/warrantys/edit-warranty", {
            layout: "admin",
            js: "admin/editWarranty",
            warranty: mongooseToObject(warranty),
            productsAndReasons,
            products: multipleMongooseToObject(products),
          });
          // console.log(productsAndReasons);
        });
      });
  }
  exportOrder(req, res) {
    const idOrder = req.query.idOrder;
    Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idOrder),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "idUser",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$details",
      },
      {
        $lookup: {
          from: "products",
          localField: "details.idVariation",
          foreignField: "variations._id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          note: { $first: "$note" },
          total: { $first: "$total" },
          // note: "$note",
          // total: "$total",
          details: {
            $push: {
              price: "$details.price",
              quantity: "$details.quantity",
              idVariation: "$details.idVariation",
              discount: "$details.discount",
              productName: "$product.name",
            },
          },
          dateOfInvoice: {
            $first: {
              $dateToString: {
                format: "%d-%m-%Y %H:%M",
                date: new Date(),
                timezone: "Asia/Ho_Chi_Minh",
              },
            },
          }, // ngày xuất hóa đơn
          shipmentDetail: { $first: "$shipmentDetail" },
        },
      },
    ]).then((order) => {
      return res.send(order);
      var html = fs.readFileSync(
        path.join(__dirname, "../../public/templates", "order.html"),
        "utf8"
      );
      var options = {
        format: "A5",
        orientation: "portrait",
        border: "10mm",
      };
      let data = {};
    });

    // var document = {
    //   html: html,
    //   data,
    //   path: path.join(__dirname, "../../public/.download", `${timeNow}.pdf`),
    //   type: "",
    // };
    //   pdf
    //     .create(document, options)
    //     .then((resPdf) => {
    //       res.download(resPdf.filename, (err) => {
    //         if (err) {
    //           console.error(err);
    //         } else {
    //           fs.unlink(resPdf.filename, (err) => {
    //             if (err) throw err;
    //           });
    //         }
    //       });
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    // });
    // Order.findOne({ _id: idOrder })
    //   .populate("idUser")
    //   .aggregate()
    //   .then((order) => {
    //     return res.send(order);
    //   });
  }
  // --------------------------------------------------newAddProduct----------------------
  newAddProduct(req, res, next) {
    Category.find().then((categorys) => {
      res.render("admin/products/newAddProduct", {
        layout: "admin",
        js: "admin/newAddProduct",
        categorys: multipleMongooseToObject(categorys),
      });
    });
  }
  // --------------------------------------------------newAddProduct----------------------
}
module.exports = new AdminController();
