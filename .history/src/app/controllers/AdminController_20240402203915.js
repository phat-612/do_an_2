const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const User = require("../models/User");

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

  // get /orderproducts
  order(req, res, next) {
    res.render("admin/orders/orderProduct", {
      layout: "admin",
      js: "admin/orderProduct",
      css: "admin/orderProduct",
    });
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
    res.render("admin/products/detailProduct", {
      layout: "admin",
      js: "admin/detailProduct",
      css: "admin/detailProduct",
    });
  }
  //get /product/edit
  editProduct(req, res, next) {
    res.render("admin/products/editProduct", {
      layout: "admin",
      js: "admin/editProduct",
      css: "admin/editProduct",
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
      .then((warranty) => {
        const productNames = warranty.details.map(
          (detail) => detail.idProduct.name
        );
        Warranty.findById(req.params.id)
        .populate("details.idProduct")
        .then((warranty) => {
          const productNames = warranty.details.map((detail) => {
            if (detail.idProduct && detail.idProduct.name) {
              return detail.idProduct.name;
            } else {
              return "Unknown Product";
            }
        const reasonsAndPrices = warranty.details
          .map((detail) => {
            if (detail.reasonAndPrice && detail.reasonAndPrice.length > 0) {
              return detail.reasonAndPrice.map((reasonPrice) => {
                // Kiểm tra reasonPrice.reason và reasonPrice.price
                if (reasonPrice.reason && reasonPrice.price) {
                  return {
                    reason: reasonPrice.reason,
                    price: reasonPrice.price,
                  };
                } else {
                  console.log(
                    "Giá trị không hợp lệ trong reasonPrice:",
                    reasonPrice
                  );
                  // Nếu reason hoặc price không hợp lệ, trả về object trống
                  return null;
                }
              });
            } else {
              return null;
            }
          })
          .flat()
          .filter((item) => item !== null);

        res.render("admin/warrantys/detail-warranty", {
          layout: "admin",
          js: "admin/detailWarranty",
          warranty: mongooseToObject(warranty),
          productNames: productNames,
          reasonsAndPrices: reasonsAndPrices,
        });
      });
  }
  editWarranty(req, res, next) {}
}
module.exports = new AdminController();
