const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Banner = require("../models/Banner");
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
          Product.aggregate([
            { $unwind: "$variations" }, // Unwind the variations array
            {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                description: { $first: "$description" },
                images: { $first: "$images" },
                view: { $first: "$view" },
                slug: { $first: "$slug" },
                idCategory: { $first: "$idCategory" },
                discount: { $first: "$discount" },
                totalSold: { $sum: "$variations.sold" },
                variations: { $push: "$variations" },
              },
            },
            { $sort: { totalSold: -1 } }, // Sort by total sold in descending order
            { $limit: 3 }, // Limit to top 3 products
          ]).then((topProducts) => {
            res.render("admin/sites/home", {
              layout: "admin",
              js: "admin/home",
              css: "admin/home",
              orders: multipleMongooseToObject(orders),
              products: multipleMongooseToObject(products),
              topProducts: topProducts,
            });
          });
        });
      })
      .catch(next);
  }
  // get /product
  product(req, res, next) {
    Product.find({})
      .then((products) => {
        res.render("admin/products/showProduct", {
          layout: "admin",
          js: "admin/showProduct",
          css: "admin/showProduct",
          products: multipleMongooseToObject(products),
        });
      })
      .catch(next);
  }
  // get /product/addproduct
  addPro(req, res, next) {
    Category.find().then((categorys) => {
      res.render("admin/products/addProduct", {
        layout: "admin",
        js: "admin/addProduct",
        css: "admin/addProduct",
        categorys: multipleMongooseToObject(categorys),
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
          attributes1: attributes1,
          attributes2: attributes2,
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
    Order.find({})
      .populate("idUser", "name")
      .then((orders) => {
        // console.log(orders);
        res.render("admin/orders/orderProduct", {
          layout: "admin",
          js: "admin/orderProduct",
          css: "admin/orderProduct",
          orders: multipleMongooseToObject(orders),
        });
      });
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
