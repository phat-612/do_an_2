const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");

class AdminController {
  // get /
  index(req, res, next) {
    res.render("admin/sites/home", {
      layout: "admin",
      js: "admin/header",
      css: "admin/home",
    });
  }
  // get /product
  product(req, res, next) {
    res.render("admin/products/showProduct", {
      layout: "admin",
      js: "admin/showProduct",
      css: "admin/showProduct",
    });
  }
  // get /detailproducts
  detail(req, res, next) {
    res.render("admin/products/detailProduct", {
      layout: "admin",
      js: "admin/detailProduct",
      css: "admin/detailProduct",
    });
  }
  // get /orderproducts
  order(req, res, next) {
    res.render("admin/products/orderProduct", {
      layout: "admin",
      js: "admin/orderProduct",
      css: "admin/orderProduct",
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
  //get /category
  category(req, res, next) {
    res.render("admin/sites/category", {
      layout: "admin",
      js: "admin/category",
      css: "admin/category",
    });
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
      warrantys: multipleMongooseToObject(warrantys),
    });
  }
}
module.exports = new AdminController();
