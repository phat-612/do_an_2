const mongoose = require("mongoose");

const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Banner = require("../models/Banner");
const Message = require("../models/Messages");

var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require("path");

const {
  getDataPagination,
  mongooseTimeToDDMMYYYY,
} = require("../../util/function");
const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
const { time } = require("console");

class AdminController {
  // // get /
  index(req, res, next) {
    Promise.all([
      Product.find({}), // Lấy tất cả sản phẩm
      Order.find({}), // Lấy tất cả đơn hàng
      Order.aggregate([
        {
          $match: {
            "paymentDetail.status": "success",
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$total" },
          },
        },
      ]),
      Product.aggregate([{ $sort: { view: -1 } }, { $limit: 4 }]),
      Product.aggregate([
        {
          $set: { totalReviews: { $size: "$reviews" } },
        },
        { $sort: { totalReviews: -1 } },
        { $limit: 4 },
        {
          $project: {
            name: 1,
            images: 1,
            totalReviews: 1,
          },
        },
      ]),
      Product.aggregate([
        { $unwind: "$variations" },
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
        { $sort: { totalSold: -1 } },
        { $limit: 4 },
      ]),
      Product.aggregate([
        { $unwind: "$reviews" },
        { $match: { "reviews.status": false } },
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
            user: { name: 1 },
          },
        },
        { $limit: 6 },
      ]),
    ])
      .then(
        ([
          products,
          orders,
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
      )
      .catch(next);
  }
  // get /product
  product(req, res, next) {
    const url = req.originalUrl;
    const find = req.query.q;
    let match = "";
    let arrMatch = [];
    if (req.query.hasOwnProperty("_filter")) {
      match = req.query.match || "discount";
      if (match === "discount") {
        arrMatch.push({
          "discount.percent": { $gt: 0 },
          "discount.startDay": { $lte: new Date() },
          "discount.endDay": { $gte: new Date() },
        });
      } else if (match == "soldOut") {
        arrMatch.push({ "variations.quantity": 0 });
      } else if (match == "unBusiness") {
        arrMatch.push({ isBusiness: false });
      }
    }
    if (find && find.trim() != "") {
      let words = find.split(" ");

      let regexWords = words.map((word) => ({
        name: { $regex: word, $options: "i" },
      }));
      arrMatch.push({ $and: regexWords });
    }
    let conditionMatch = {};
    if (arrMatch.length != 0) {
      conditionMatch = { $and: arrMatch };
    }
    Promise.all([
      Product.find(conditionMatch).populate("idCategory", "name").paginate(req),
      Product.find(conditionMatch),
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
        match,
        currentPage,
        totalPage,
        url,
      });
    });
  }
  // get /product/addproduct
  addPro(req, res, next) {
    Category.find({})
      .populate("idParent", "name")
      .then((categories) => {
        const categoryMap = new Map(
          categories.map((cat) => [cat._id.toString(), cat])
        );

        // Tính cấp độ của từng danh mục
        const categoryWithLevels = categories.map((category) => {
          let level = 0;
          let parent = category.idParent;
          const visited = new Set(); // Kiểm tra vòng lặp vòng tròn

          while (parent) {
            if (visited.has(parent._id.toString())) {
              level = -1; // Đánh dấu lỗi
              break;
            }
            visited.add(parent._id.toString());

            level++;
            parent = categoryMap.get(parent._id.toString())?.idParent || null;
          }

          category.level = level; // Gán cấp độ
          return category;
        });

        // Sắp xếp theo cấp độ
        const sortedCategories = categoryWithLevels.sort(
          (a, b) => a.level - b.level
        );

        // Render view
        res.render("admin/products/addProduct", {
          title: "Thêm Sản Phẩm",
          layout: "admin",
          js: "admin/addProduct",
          css: "admin/addProduct",
          categories: multipleMongooseToObject(sortedCategories),
        });
      });
  }
  //get /product/edit/:id
  editProduct(req, res, next) {
    Category.find()
      .populate("idParent", "name")
      .then((categorys) => {
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
          // return res.json(storeCategory);
          res.render("admin/products/editProduct", {
            title: "Sửa Sản Phẩm",
            product: mongooseToObject(product),
            layout: "admin",
            js: "admin/editProduct",
            css: "admin/editProduct",
            categorys: multipleMongooseToObject(storeCategory),
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

  // order(req, res, next) {
  //   const status = req.query.status; // Lọc theo trạng thái
  //   const sortOrder = req.query.sortOrder || "default"; // Thứ tự sắp xếp
  //   const url = req.originalUrl; // Lưu URL hiện tại để giữ tham số khi phân trang
  //   let match = {}; // Điều kiện lọc

  //   // Lọc trạng thái nếu có
  //   if (
  //     status &&
  //     ["success", "pending", "failed", "shipping", "cancel"].includes(status)
  //   ) {
  //     match.status = status;
  //   }

  //   // Trạng thái mặc định sẽ là 1
  //   let page = parseInt(req.query.page) || 1;
  //   let perPage = 10; // Mỗi trang hiển thị 10 đơn hàng
  //   let skipValue = (page - 1) * perPage;

  //   // Hàm để sắp xếp đơn hàng theo thứ tự trạng thái
  //   const orderMap = {
  //     pending: 0,
  //     shipping: 1,
  //     success: 2,
  //     failed: 3,
  //     cancel: 4,
  //   };

  //   // Hàm để sắp xếp theo thứ tự mặc định hoặc ngược lại
  //   const sortStatuses = (order) => {
  //     const reverseOrder = {
  //       cancel: 0,
  //       failed: 1,
  //       success: 2,
  //       shipping: 3,
  //       pending: 4,
  //     };
  //     return order === "reverse" ? reverseOrder : orderMap;
  //   };

  //   // Sắp xếp theo trạng thái trong cơ sở dữ liệu
  //   const statusesOrder = sortStatuses(sortOrder);

  //   // Sử dụng aggregate để sắp xếp trong cơ sở dữ liệu
  //   Order.aggregate([
  //     { $match: match }, // Lọc các đơn hàng theo điều kiện
  //     {
  //       $addFields: {
  //         statusOrder: {
  //           $indexOfArray: [Object.values(statusesOrder), "$status"],
  //         },
  //       },
  //     }, // Tạo trường statusOrder dựa trên thứ tự trạng thái
  //     { $sort: { statusOrder: 1 } }, // Sắp xếp theo trường statusOrder
  //     { $skip: skipValue }, // Phân trang
  //     { $limit: perPage }, // Giới hạn số lượng đơn hàng mỗi trang
  //   ])
  //     .then((orders) => {
  //       // Tính tổng số đơn hàng
  //       Order.countDocuments(match).then((totalOrders) => {
  //         let totalPage = Math.ceil(totalOrders / perPage); // Tổng số trang

  //         // Tổng hợp số lượng đơn hàng theo trạng thái
  //         Promise.all([
  //           Order.find({ status: "pending" }).countDocuments(),
  //           Order.find({ status: "shipping" }).countDocuments(),
  //           Order.find({ status: "success" }).countDocuments(),
  //           Order.find({ status: "failed" }).countDocuments(),
  //           Order.find({ status: "cancel" }).countDocuments(),
  //         ]).then(
  //           ([
  //             totalPending,
  //             totalShipping,
  //             totalSuccess,
  //             totalFailed,
  //             totalCancel,
  //           ]) => {
  //             res.render("admin/orders/orderProduct", {
  //               title: "Quản lý đơn hàng",
  //               layout: "admin",
  //               js: "admin/orderProduct",
  //               css: "admin/orderProduct",
  //               orders: orders,
  //               totalOrders,
  //               totalPage,
  //               totalPending,
  //               totalShipping,
  //               totalSuccess,
  //               totalFailed,
  //               totalCancel,
  //               currentPage: page,
  //               url,
  //               sortOrder,
  //               status,
  //             });
  //           }
  //         );
  //       });
  //     })
  //     .catch(next);
  // }

  order(req, res, next) {
    const name = req.query.name;
    const status = req.query.status;
    const url = req.originalUrl;
    let match = {};
    let sortOrder = req.query.sort === "desc" ? -1 : 1;
    let fieldSort = req.query.fieldSort || "createdAt";
    if (!req.query.sort || !req.query.fieldSort) {
      sortOrder = -1;
      fieldSort = "createdAt";
    }
    // Trạng thái tìm kiếm
    if (
      status === "success" ||
      status === "pending" ||
      status === "failed" ||
      status === "shipping" ||
      status === "cancel"
    ) {
      match.status = status;
    }

    // Trạng hiện tại mặc định là 1
    let page = parseInt(req.query.page) || 1;
    let perPage = 10;
    let skipValue = page * perPage - perPage;

    // pending: 1,
    // shipping: 2,
    // success: 3,
    // failed: 4,
    // cancel: 5,

    // Sử dụng aggregate để sắp xếp các đơn hàng
    const findUsers = async () => {
      if (name) {
        let users = await User.find({ name: new RegExp(name, "i") });
        let userIds = users.map((user) => user._id);
        match.idUser = { $in: userIds };
      }
      return match;
    };
    function sortOrderField(fieldSort, type) {
      // type: 1, -1
      switch (fieldSort) {
        case "status":
          return Order.aggregate([
            { $match: match },
            {
              $addFields: {
                statusOrder: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$status", "pending"] }, then: 1 },
                      { case: { $eq: ["$status", "shipping"] }, then: 2 },
                      { case: { $eq: ["$status", "success"] }, then: 3 },
                      { case: { $eq: ["$status", "failed"] }, then: 4 },
                      { case: { $eq: ["$status", "cancel"] }, then: 5 },
                    ],
                    default: 6,
                  },
                },
              },
            },
            {
              $lookup: {
                from: "users", // Tên collection cần join
                localField: "idUser", // Trường trong collection hiện tại
                foreignField: "_id", // Trường trong collection cần join
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            { $sort: { statusOrder: type } }, // Sắp xếp theo thứ tự trạng thái
            { $skip: skipValue },
            { $limit: perPage },
          ]);
        default:
          return Order.aggregate([
            { $match: match },
            {
              $lookup: {
                from: "users", // Tên collection cần join
                localField: "idUser", // Trường trong collection hiện tại
                foreignField: "_id", // Trường trong collection cần join
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            { $sort: { [fieldSort]: type } },
            { $skip: skipValue },
            { $limit: perPage },
          ]);
      }
    }
    findUsers()
      .then((match) => {
        return Promise.all([
          Order.countDocuments(match),
          sortOrderField(fieldSort, sortOrder),
          Order.countDocuments(),
          Order.find({ status: "pending" }).countDocuments(),
          Order.find({ status: "success" }).countDocuments(),
          Order.find({ status: "failed" }).countDocuments(),
          Order.find({ status: "shipping" }).countDocuments(),
          Order.find({ status: "cancel" }).countDocuments(),
          Order.countDocuments(),
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
          totalUnchangedOrders,
        ]) => {
          let totalPage = Math.ceil(totalOrders / perPage);
          res.render("admin/orders/orderProduct", {
            title: "Quản lý đơn hàng",
            layout: "admin",
            js: "admin/orderProduct",
            css: "admin/orderProduct",
            orders: orders,
            allOrders: allOrders,
            currentPage: page,
            totalPage: totalPage,
            totalOrders: totalOrders,
            totalPending: totalPending,
            totalSuccess: totalSuccess,
            totalFailed: totalFailed,
            totalShipping: totalShipping,
            totalCancel: toltalCancel,
            totalUnchangedOrders: totalUnchangedOrders,
            url,
            fieldSort,
            sort: sortOrder == -1 ? "desc" : "asc", // Trả về giá trị sort để giữ lại trạng thái sắp xếp
          });
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
      .sort({ idParent: 1 })
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
              .sort({ idParent: 1 })

              .populate("idParent", "name")
              .then((category) => {
                // console.log(category);

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
              });
          }
        );
      });
  }
  // //get /assessProviders
  // accessProviders(req, res, next) {
  //   let searchQuery = req.query.searchQuery || "";
  //   const url = req.originalUrl;
  //   let match = "";
  //   let arrMatch = [];
  //   User.paginate(
  //     // regex trả về 1 chuổi ,$regex tìm kiếm chỉ quy , i bất kể hoa thường
  //     { email: { $regex: searchQuery, $options: "i" } },
  //     { page: req.query.page, limit: req.query.limit }
  //   ).then((users) => {
  //     // tinh tổng số lượng user đang có
  //     User.countDocuments({
  //       email: { $regex: searchQuery, $options: "i" },
  //     }).then((count) => {
  //       const usersData = users.map((user) => {
  //         return {
  //           id: user._id,
  //           role: user.role,
  //         };
  //       });
  //       const perPage = parseInt(req.query.limit) || 10;
  //       let page = parseInt(req.query.page) || 1;
  //       page = page <= 0 ? 1 : page;
  //       let totalPage = Math.ceil(count / perPage);

  //       res.render("admin/sites/accessProviders", {
  //         title: "Quản Lý Phân Quyền",
  //         layout: "admin",
  //         js: "admin/accessProviders",
  //         user: usersData,
  //         users: multipleMongooseToObject(users), // Adjusted here
  //         currentPage: page,
  //         totalPage: totalPage,
  //         url,
  //       });
  //     });
  //   });
  // }
  accessProviders(req, res, next) {
    let searchQuery = req.query.searchQuery || "";
    const url = req.originalUrl;
    let match = req.query.match || "";
    let filter = {};

    if (searchQuery) {
      // regex trả về 1 chuổi ,$regex tìm kiếm chỉ quy , i bất kể hoa thường
      filter.email = { $regex: searchQuery, $options: "i" };
    }

    if (match) {
      filter.role = match;
    }

    User.paginate(filter, {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    })
      .then((users) => {
        User.countDocuments(filter).then((count) => {
          const perPage = parseInt(req.query.limit) || 10;
          let page = parseInt(req.query.page) || 1;
          page = page <= 0 ? 1 : page;
          let totalPage = Math.ceil(count / perPage);

          res.render("admin/sites/accessProviders", {
            title: "Quản Lý Phân Quyền",
            layout: "admin",
            js: "admin/accessProviders",
            users: multipleMongooseToObject(users),
            currentPage: page,
            totalPage: totalPage,
            url,
            match,
          });
        });
      })
      .catch((error) => next(error));
  }

  orderFromUser(req, res, next) {
    // tên, ảnh giá, của một sản phẩm đầu tiên, thời gian
    const idUser = req.params.id;
    let nameUser;
    User.findOne({ _id: idUser }).then((user) => {
      nameUser = user.name;
    });

    Order.aggregate([
      {
        $match: { idUser: new mongoose.Types.ObjectId(idUser) },
      },
      {
        $sort: { createdAt: -1 },
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
        $lookup: {
          from: "products",
          localField: "details.idVariation",
          foreignField: "variations._id",
          as: "product",
        },
      },
      {
        $project: {
          _id: 1,
          nameUser: "$user.name",
          total: 1,
          status: 1,
          createdAt: 1,
          point: "$user.point",
          name: { $arrayElemAt: ["$product.name", 0] },
          image: {
            $arrayElemAt: [
              {
                $arrayElemAt: ["$product.images", 0],
              },
              0,
            ],
          },
          quantityProduct: { $size: "$details" },
        },
      },
    ]).then((orders) => {
      if (req.query.hasOwnProperty("_filter")) {
        orders = orders.filter(
          (order) => order[req.query.column] == req.query.value
        );
      }
      Order.find(
        { idUser },
        {
          _id: 1,
          total: 1,
          paymentDetail: 1,
          status: 1,
        }
      ).then((tempOrders) => {
        let countOrder = tempOrders.length;
        let totalMoneyPaid = tempOrders.reduce((total, order) => {
          if (
            order.paymentDetail.status == "success" &&
            order.status == "success"
          ) {
            return total + order.total;
          }
          return total;
        }, 0);
        const userPoint = orders.length > 0 ? orders[0].point : 0;
        res.render("admin/sites/orderFromUser", {
          title: "Đơn hàng Người Dùng",
          layout: "admin",
          js: "admin/orderFromUser",
          orders,
          countOrder,
          totalMoneyPaid,
          userPoint,
          nameUser,
          idUser,
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

  listMessage(req, res) {
    const id = req.session.idUser;
    Message.find({})
      .populate("sender", "name")
      .then((messages) => {
        const messagesWithLast = messages.map((msg) => {
          const message = msg.message[msg.message.length - 1] || null;
          return {
            ...msg.toObject(),
            message,
            userName: msg.sender.name,
          };
        });
        // Sắp xếp messagesWithLast theo thời gian của tin nhắn mới nhất (message.timestamp)
        messagesWithLast.sort((a, b) => {
          const timeA = a.message ? new Date(a.message.timestamp) : 0; // Nếu không có tin nhắn, sử dụng thời gian 0
          const timeB = b.message ? new Date(b.message.timestamp) : 0;
          return timeB - timeA; // Sắp xếp theo thứ tự giảm dần (tin nhắn mới nhất lên đầu)
        });

        res.render("admin/Chatbox/listMessage", {
          layout: "admin",
          title: "List Message",
          js: "admin/ChatboxAdmin",
          messages: messagesWithLast,
          id,
        });
      })
      .catch((err) => {
        console.error("Lỗi khi lấy tin nhắn:", err);
        res.status(500).send("Lỗi server");
      });
  }

  // Q&A
  getCommmentPage(req, res, next) {
    const limit = 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * limit;
    Product.aggregate([
      { $match: { "comments.status": false } },
      { $unwind: "$comments" },
      { $match: { "comments.status": false } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "comments.idUser",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          idProduct: "$_id",
          idComment: "$comments._id",
          productName: "$name",
          fullname: "$userDetails.name",
          comment: "$comments.comment",
          timeUpdate: {
            $dateToString: { format: "%d/%m/%Y", date: "$comments.timeUpdate" },
          },
          slug: "$slug",
        },
      },
    ])
      .then((comments) => {
        Product.aggregate([
          { $match: { "comments.status": false } },
          { $unwind: "$comments" },
          { $match: { "comments.status": false } },
          { $count: "totalComments" },
        ]).then((countResult) => {
          const totalComments =
            countResult.length > 0 ? countResult[0].totalComments : 0;
          const totalPage = Math.ceil(totalComments / limit);
          return res.render("admin/sites/comment", {
            title: "Quản Lý Bình Luận",
            layout: "admin",
            comments,
            url: req.originalUrl,
            currentPage: page,
            totalPage,
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  }
  // store management

  getStorePage(req, res, next) {
    res.render("admin/stores/showStore", {
      title: "Danh Sách Cửa Hàng",
      layout: "admin",
      js: "admin/store",
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
