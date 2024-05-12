const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Category = require("../models/Category");
const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");

class AdminController {
  // get /
  index(req, res, next) {
    res.render("admin/sites/home", {
      layout: "admin",
      js: "admin/home",
      css: "admin/home",
    });
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

              return detailObject;
            }
          );
        });

        Promise.all(promises).then((result) => {
          res.render("admin/orders/orderDetail", {
            layout: "admin",
            js: "admin/orderDetail",
            css: "admin/orderDetail",
            orders: result, // Key 'orders' chứa mảng 'result' chứa chi tiết sản phẩm
            order: order, // Key 'order' chứa thông tin toàn bộ đơn hàng
          });
          // console.log(result);
        });
      });
  }
  //get /product/addproduct
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
          // console.log(product);
          return res.render("admin/products/detailProduct", {
            product,
            layout: "admin",
            js: "admin/detailProduct",
          });
        });
      })
      .catch(next);
  }
  //get /product/edit/:id
  editProduct(req, res, next) {
    Category.find().then((categorys) => {
      Product.findById(req.params.id)
        .then((product) =>
          res.render("admin/products/editProduct", {
            product: mongooseToObject(product),
            layout: "admin",
            js: "admin/editProduct",
            css: "admin/editProduct",
            categorys: multipleMongooseToObject(categorys),
          })
        )
        .catch(next);
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
        res.render("admin/sites/accessProviders", {
          layout: "admin",
          js: "admin/accessProviders",
          users: multipleMongooseToObject(users),
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
}
module.exports = new AdminController();
