const Warranty = require("../models/Warranty");
const { multipleMongooseToObject } = require("../../util/mongoose");
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
  createWarranty(req, res, next) {
    res.render("admin/warrantys/create-warranty", { layout: "admin" });
  }
  showWarranty(req, res, next) {
    // res.render("admin/warrantys/show-warranty", { layout: "admin" });
    Warranty.findOne({}).then(() =>
      res.render("admin/warrantys/show-warranty", { layout: "admin" })
    );
  }
}
module.exports = new AdminController();
