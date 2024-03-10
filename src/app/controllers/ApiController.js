const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");

const {} = require("../../util/function");
const { default: mongoose } = require("mongoose");
class ApiController {
  // api user,admin
  // api user
  // aip admin
  storeCategory(req, res, next) {
    const formData = req.body;
    const category = new Category(formData);
    category
      .save()
      .then(() => {
        res.status(200);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  storeWarranty(req, res, next) {
    const formData = req.body;
    const warranty = new Warranty(formData);
    warranty
      .save()
      .then(() => {
        res.send("Tạo thành công");
      })
      .catch((error) => {});
  }
  // test api
  test(req, res, next) {
    console.log(req.body);
    const product = new Product(req.body);
    product
      .save()
      .then(() => {
        res.send("Thêm thành công");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  testAddCategory(req, res, next) {
    const category = new Category(req.body);
    category
      .save()
      .then(() => {
        res.send("Thêm thành công");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  testGetProduct(req, res, next) {
    Product.find({
      "variations._id": "65ed65e2c3155828e37b0aa6",
    })
      .then((products) => {
        res.send(products);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  testUpdateQuantity(req, res, next) {
    const id = req.body.id;
    const quantity = req.body.quantity;
    console.log(req.body);
    Product.updateOne(
      { "variations._id": id },
      { $set: { "variations.$.quantity": quantity } }
    )
      .then(() => {
        res.send("Cập nhật thành công");
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
module.exports = new ApiController();
