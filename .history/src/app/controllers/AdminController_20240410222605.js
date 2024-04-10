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
      .then((orders) => {
        res.render("admin/orders/orderProduct", {
          layout: "admin",
          js: "admin/orderProduct",
          css: "admin/orderProduct",
        });
      })
      .catch(next);
  }
  // get /order/detail
  orderDetail(req, res, next) {
    res.render("admin/orders/orderDetail", {
      layout: "admin",
      js: "admin/orderDetail",
      css: "admin/orderDetail",
    });
  }
  //get /product/addproduct
  addPro(req, res, next) {
    res.render("admin/products/addProduct", {
      layout: "admin",
      js: "admin/addProduct",
      css: "admin/addProduct",
    });
  }
  // get /product/detail
  detail(req, res, next) {
    Product.findById(req.params.id)
      .then((product) =>
        res.render("admin/products/detailProduct", {
          product: mongooseToObject(product),
          layout: "admin",
          js: "admin/detailProduct",
          css: "admin/detailProduct",
        })
      )
      .catch(next);
  }
  //get /product/edit/:id
  editProduct(req, res, next) {
    Product.findById(req.params.id)
      .then((product) =>
        res.render("admin/products/editProduct", {
          product: mongooseToObject(product),
          layout: "admin",
          js: "admin/editProduct",
          css: "admin/editProduct",
        })
      )
      .catch(next);
  }
  //get /category
  category(req, res, next) {
    Category.findbyid({})
      .populate("idParent", "name")
      .then((category) => {
        res.render("admin/sites/category", {
          layout: "admin",
          js: "admin/category",
          css: "admin/category",
          category: multipleMongooseToObject(category),
        });
        // console.log(category);
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
        // console.log(warranty);
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
        // console.log(productsAndReasons);
      });
  }
  editWarranty(req, res, next) {
    Warranty.findById(req.params.id)
      .populate("details.idProduct")
      .exec()
      .then((warranty) => {
        // console.log(warranty);
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

        res.render("admin/warrantys/edit-warranty", {
          layout: "admin",
          warranty: mongooseToObject(warranty),
          productsAndReasons,
        });
        // console.log(productsAndReasons);
      });
  }
}
module.exports = new AdminController();
