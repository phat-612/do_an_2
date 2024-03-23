const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const UserLogin = require("../models/UserLogin");
const User = require("../models/User");

var validator = require("email-validator");
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
    const images = req.files.map((file) => {
      return file.filename;
    });
    formData.images = images;
    const warranty = new Warranty(formData);
    warranty.save().then(() => {
      res.redirect("/admin/warranty/show");
    });
  }
  signUp(req, res, next) {
    const formData = req.body;
    // kiểm tra mật khẩu trùng khớp
    if (formData.password !== formData.confirmPassword) {
      return res.status(422).json({ message: "Mật khẩu không trùng khớp" });
    }
    // kiểm tra email hợp lệ
    if (!validator.validate(formData.email)) {
      return res.status(422).json({ message: "Email không hợp lệ" });
    }
    User.findOne({ email: formData.email }).then((user) => {
      if (user) {
        // khi email đã tồn tại
        return res.status(422).json({ message: "Email đã tồn tại" });
      } else {
        // khi email chưa tồn tại
        const user = new User({
          email: formData.email,
          name: formData.name,
        });
        user
          .save()
          .then((saveUser) => {
            // lưu thông tin đăng nhập
            const userLogin = new UserLogin({
              idUser: saveUser._id,
              email: formData.email,
              password: formData.password,
            });
            userLogin.save().then(() => {
              return res.redirect("/login");
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
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
