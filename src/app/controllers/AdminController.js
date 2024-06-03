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
              { $sort: { view: -1 } }, // Sắp xếp theo lượt view giảm dần
              { $limit: 4 }, // Lấy ra 4 sản phẩm
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
            Product.aggregate([
              {
                $unwind: "$reviews",
              },
              {
                $match: {
                  "reviews.status": false,
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "reviews.idUser",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $unwind: "$user",
              },
              {
                $project: {
                  name: 1,
                  images: 1,
                  reviews: 1,
                  user: {
                    name: 1,
                  },
                },
              },
              { $limit: 6 },
            ]),
          ]).then(
            ([
              doanhThu,
              topSeenProduct,
              topReviewProduct,
              topProducts,
              assessReview,
            ]) => {
              doanhThu = doanhThu[0] ? doanhThu[0].totalAmount : 0;
              res.render("admin/sites/home", {
                layout: "admin",
                title: "Trang chủ",
                js: "admin/home",
                css: "admin/home",
                orders: multipleMongooseToObject(orders),
                products: multipleMongooseToObject(products),
                topProducts: topProducts,
                topReviewProduct: topReviewProduct,
                doanhThu: doanhThu,
                topSeenProduct: topSeenProduct,
                assessReview: assessReview,
              });
            }
          );
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
        title: "Danh Sách Sản Phẩm",
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
          title: "Thêm Sản Phẩm",
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
          title: "Sửa Sản Phẩm",
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
            title: "Chi Tiết Sản Phẩm",
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
    const name = req.query.name;
    const status = req.query.status;
    const url = req.originalUrl;
    let match = {};
    // trạng thái tìm kiếm
    if (
      status === "success" ||
      status === "pending" ||
      status === "failed" ||
      status === "shipping" ||
      status === "cancel"
    ) {
      match.status = status;
    }
    // console.log(match);

    // trạng hiện tại mặc định là 1
    let page = parseInt(req.query.page) || 1;

    // 10 đơn hàng
    let perPage = 10;

    // skip
    let skipValue = page * perPage - perPage;
    // tìm tên trên url
    const findUsers = async () => {
      if (name) {
        //RegExp xác định chuỗi
        let users = await User.find({ name: new RegExp(name, "i") });
        let userIds = users.map((user) => user._id);
        match.idUser = { $in: userIds };
      }
      return match;
    };

    findUsers()
      .then((match) => {
        return Promise.all([
          Order.countDocuments(match),
          Order.find(match)
            .populate("idUser", "name")
            .skip(skipValue)
            .limit(perPage),
          Order.countDocuments(), // tổng số đơn hàng
          Order.find({ status: "pending" }).countDocuments(),
          Order.find({ status: "success" }).countDocuments(),
          Order.find({ status: "failed" }).countDocuments(),
          Order.find({ status: "shipping" }).countDocuments(),
          Order.find({ status: "cancel" }).countDocuments(),

          Order.countDocuments(), // số lượng sản phẩm không thay đổi
        ]);
      })
      .then(
        ([
          totalOrders,
          orders,
          allOrders,
          totalPending,
          totalSuccess,
          totalFailed,
          totalShipping,
          toltalCancel,
          totalUnchangedOrders, // The new variable
        ]) => {
          let totalPage = Math.ceil(totalOrders / perPage);
          res.render("admin/orders/orderProduct", {
            title: "Quản lý đơn hàng",
            layout: "admin",
            js: "admin/orderProduct",
            css: "admin/orderProduct",
            orders: multipleMongooseToObject(orders),
            allOrders: allOrders,
            currentPage: page,
            totalPage: totalPage,
            totalOrders: totalOrders,
            totalPending: totalPending,
            totalSuccess: totalSuccess,
            totalFailed: totalFailed,
            totalShipping: totalShipping,
            toltalCancel: toltalCancel,
            totalUnchangedOrders: totalUnchangedOrders, // Include the new variable in the response
            url,
          });
          // console.log(toltalCancel);
        }
      );
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
              // tên sản phẩm
              detailObject.productName = productName;
              // thuộc tính sản phẩm của đơn hàng (ram , màu,....)
              detailObject.variationAttributes = variationAttributes;
              let discountedPrice =
                detail.price - detail.price * (detail.discount / 100);
              // tổng tiền đã giảm
              detailObject.totalPrice = discountedPrice * detail.quantity;
              // giá chưa giảm
              detailObject.originalTotalPrice = detail.price * detail.quantity;
              return detailObject;
            }
          );
        });

        Promise.all(promises).then((result) => {
          // result mảng chứa tên , thuộc tính,giá chưa giảm , giá đã giảm, giá sản phẩm ,só lượng
          res.render("admin/orders/orderDetail", {
            title: "Chi Tiết Đơn Hàng",
            layout: "admin",
            js: "admin/orderDetail",
            css: "admin/orderDetail",
            orders: result,
            order: order,
            totalNotSale: totalNotSale, //gia chua giam
          });
          // console.log(result);
        });
      });
  }

  //get /category

  category(req, res, next) {
    const searchName = req.query.search;
    const url = req.originalUrl;

    Category.find({ name: new RegExp(searchName, "i") })
      .populate("idParent", "name")
      .paginate(req)
      .then((categories) => {
        Category.countDocuments({ name: new RegExp(searchName, "i") }).then(
          (count) => {
            // console.log(count);
            // danh mục có con
            const categoryIdParent = [];
            // danh mục gốc
            const categoryNotIdParent = [];

            categories.forEach((category) => {
              if (category.idParent) {
                categoryIdParent.push(category);
              } else {
                categoryNotIdParent.push(category);
              }
            });

            const perPage = parseInt(req.query.limit) || 10;
            let page = parseInt(req.query.page) || 1;
            page = page <= 0 ? 1 : page;
            let totalPage = Math.ceil(count / perPage);
            const storeCategory = categoryNotIdParent.concat(categoryIdParent);
            Category.find()
              .populate("idParent", "name")
              .then((category) => {
                res.render("admin/sites/category", {
                  title: "Quản Lý Danh Mục",
                  layout: "admin",
                  js: "admin/category",
                  css: "admin/category",
                  // danh mục phân trang
                  category: multipleMongooseToObject(storeCategory),
                  // toàn bộ danh mục
                  categories: multipleMongooseToObject(category),
                  currentPage: page,
                  totalPage: totalPage,
                  url,
                });
                // console.log(category);
              });
          }
        );
      });
  }
  //get /assessProviders
  accessProviders(req, res, next) {
    let searchQuery = req.query.searchQuery || "";
    const url = req.originalUrl;
    User.paginate(
      // regex trả về 1 chuổi ,$regex tìm kiếm chỉ quy , i bất kể hoa thường
      { email: { $regex: searchQuery, $options: "i" } },
      { page: req.query.page, limit: req.query.limit }
    ).then((users) => {
      // tinh tổng số lượng user đang có
      User.countDocuments({
        email: { $regex: searchQuery, $options: "i" },
      }).then((count) => {
        const usersData = users.map((user) => {
          return {
            id: user._id,
            role: user.role,
          };
        });
        const perPage = parseInt(req.query.limit) || 10;
        let page = parseInt(req.query.page) || 1;
        page = page <= 0 ? 1 : page;
        let totalPage = Math.ceil(count / perPage);

        res.render("admin/sites/accessProviders", {
          title: "Quản Lý Phân Quyền",
          layout: "admin",
          js: "admin/accessProviders",
          user: usersData,
          users: multipleMongooseToObject(users), // Adjusted here
          currentPage: page,
          totalPage: totalPage,
          url,
        });
      });
    });
  }
  accessReview(req, res, next) {
    Product.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.status": false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reviews.idUser",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          name: 1,
          images: 1,
          reviews: 1,
          user: {
            name: 1,
          },
        },
      },
    ]).then((products) => {
      return res.render("admin/sites/accessReview", {
        title: "Quản Lý Đánh Giá",
        layout: "admin",
        products,
      });
    });
  }
  //minh luan
  createWarranty(req, res, next) {
    Product.find().then((products) => {
      res.render("admin/warrantys/create-warranty", {
        title: "Tạo đơn bảo hành",
        layout: "admin",
        js: "admin/createWarranty",
        products: multipleMongooseToObject(products),
      });
    });
  }
  async showWarranty(req, res, next) {
    const warrantys = await Warranty.find({});
    res.render("admin/warrantys/show-warranty", {
      title: "Quản lý đơn bảo hành",
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
          title: "Chi Tiết Bảo Hành",
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
            title: "Chỉnh Sửa Bảo Hành",
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
          method: { $first: "$paymentDetail.method" },
          status: { $first: "$paymentDetail.status" },
          details: {
            $push: {
              price: "$details.price",
              quantity: "$details.quantity",
              idVariation: "$details.idVariation",
              discount: "$details.discount",
              productName: "$product.name",
              totalPrice: {
                $multiply: ["$details.price", "$details.quantity"],
              },
            },
          },
          // totalDiscount: { $multiply: ["$details.totalPrice"] },
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
      order = order[0];
      const timeNow = new Date().getTime();
      var html = fs.readFileSync(
        path.join(__dirname, "../../public/templates", "order.html"),
        "utf8"
      );
      var options = {
        format: "A5",
        orientation: "portrait",
        border: "5mm",
        footer: {
          height: "5mm",
          contents: {
            default:
              '<p style="text-align:center">Cảm ơn quý khách đã sử dụng dịch vụ của CellPhoneZ</p>', // fallback value
          },
        },
      };
      let totalDiscount = 0;
      let totalProductPrice = 0;
      order.details.forEach(function (detail, index) {
        if (detail.discount) {
          totalDiscount +=
            detail.price * detail.quantity * (detail.discount / 100);
        }
        detail.stt = index + 1;
        totalProductPrice += detail.totalPrice;
      });
      if (order.method == "cod") {
        order.method = "Thanh toán bằng tiền mặt khi nhận hàng";
      } else {
        order.method = "Thanh toán trực tuyến";
      }
      if (order.status == "success") {
        order.status = "Đã Thanh Toán";
      } else {
        order.status = "Chưa Thanh Toán";
      }
      // return res.send(order);
      let data = {
        id: order._id,
        dateOfInvoice: order.dateOfInvoice,
        nameUser: order.user.name,
        phoneUser: order.user.phone,
        note: order.note,
        total: order.total,
        method: order.method,
        status: order.status,
        nameShip: order.shipmentDetail.name,
        phoneShip: order.shipmentDetail.phone,
        addressShip: order.shipmentDetail.address,
        details: order.details,
        paymentDetail: order.paymentDetail,
        totalDiscount: totalDiscount.toLocaleString("vi-VN"),
        totalProductPrice: totalProductPrice.toLocaleString("vi-VN"),
      };
      Object.keys(data).forEach((key) => {
        if (typeof data[key] == "number") {
          data[key] = data[key].toLocaleString("vi-VN");
        }
      });
      var document = {
        html: html,
        data,
        path: path.join(__dirname, "../../public/.download", `${timeNow}.pdf`),
        type: "",
      };
      pdf
        .create(document, options)
        .then((resPdf) => {
          res.download(resPdf.filename, (err) => {
            if (err) {
              console.error(err);
            } else {
              fs.unlink(resPdf.filename, (err) => {
                if (err) throw err;
              });
            }
          });
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  exportWarranty(req, res) {
    const idWarranty = req.query.idWarranty;
    Warranty.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idWarranty),
        },
      },
      {
        $unwind: "$details",
      },
      {
        $lookup: {
          from: "products",
          localField: "details.idProduct",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$_id",
          email: { $first: "$email" },
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          address: { $first: "$address" },
          note: { $first: "$note" },
          status: { $first: "$status" },
          total: { $first: "$total" },
          details: {
            $push: {
              idProduct: "$details.idProduct",
              reasonAndPrice: "$details.reasonAndPrice",
              product: "$product",
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
        },
      },
    ]).then((warranty) => {
      warranty = warranty[0];
      const timeNow = new Date().getTime();
      var html = fs.readFileSync(
        path.join(__dirname, "../../public/templates", "warranty.html"),
        "utf8"
      );
      var options = {
        format: "A5",
        orientation: "portrait",
        border: "5mm",
        footer: {
          height: "5mm",
          contents: {
            default:
              '<p style="text-align:center">Cảm ơn quý khách đã sử dụng dịch vụ của CellPhoneZ</p>', // fallback value
          },
        },
      };
      if (warranty.status == "paid") {
        warranty.status = "Đã Trả Hàng";
      } else if (warranty.status == "success") {
        warranty.status = "Đã Sửa";
      } else if (warranty.status == "fixing") {
        warranty.status = "Đang Sửa";
      } else {
        warranty.status = "Chờ Xác Nhận";
      }
      // return res.send(warranty);
      let data = {
        id: warranty._id,
        dateOfInvoice: warranty.dateOfInvoice,
        name: warranty.name,
        phone: warranty.phone,
        email: warranty.email,
        note: warranty.note,
        status: warranty.status,
        details: warranty.details,
        total: warranty.total,
      };
      Object.keys(data).forEach((key) => {
        if (typeof data[key] == "number") {
          data[key] = data[key].toLocaleString("vi-VN");
        }
      });
      var document = {
        html: html,
        data,
        path: path.join(__dirname, "../../public/.download", `${timeNow}.pdf`),
        type: "",
      };
      pdf
        .create(document, options)
        .then((resPdf) => {
          res.download(resPdf.filename, (err) => {
            if (err) {
              console.error(err);
            } else {
              fs.unlink(resPdf.filename, (err) => {
                if (err) throw err;
              });
            }
          });
        })
        .catch((error) => {
          console.error(error);
        });
    });
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
