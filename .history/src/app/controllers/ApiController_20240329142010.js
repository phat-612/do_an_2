const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const UserLogin = require("../models/UserLogin");
const User = require("../models/User");
// ------------------------
require("dotenv").config();
const validator = require("email-validator");
const bcrypt = require("bcrypt");
const {} = require("../../util/function");

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
    console.log(formData);
    const warranty = new Warranty(formData);
    warranty.save().then(() => {
      res.redirect("/admin/warranty/show");
    });
  }
  // api account
  signUp(req, res, next) {
    const formData = req.body;
    let messageError = "";
    // kiểm tra mật khẩu trùng khớp
    if (formData.password !== formData.confirmPassword) {
      messageError = "Mật khẩu không trùng khớp";
    }
    // kiểm tra email hợp lệ
    if (!validator.validate(formData.email)) {
      messageError = "Email không hợp lệ";
    }
    User.findOne({ email: formData.email }).then((user) => {
      if (user) {
        messageError = "Email đã tồn tại";
      }
      if (messageError) {
        return res.render("user/sites/signUp", {
          messageError,
          formData: {
            email: formData.email,
            name: formData.name,
          },
        });
      }
      // khi email chưa tồn tại
      let newUser = new User({
        email: formData.email,
        name: formData.name,
      });
      newUser
        .save()
        .then(async (saveUser) => {
          // lưu thông tin đăng nhập
          const hashPassword = await bcrypt.hashSync(
            formData.password,
            parseInt(process.env.SALT_OR_ROUNDS)
          );
          const userLogin = new UserLogin({
            idUser: saveUser._id,
            email: formData.email,
            password: hashPassword,
          });
          userLogin.save().then(() => {
            return res.redirect("/login");
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
  login(req, res, next) {
    const formData = req.body;
    UserLogin.findOne({ email: formData.email }).then(async (userLogin) => {
      let checkUser = true;
      if (!userLogin) {
        checkUser = false;
      } else {
        checkUser = await bcrypt.compare(formData.password, userLogin.password);
      }
      console.log(checkUser);
      if (!checkUser) {
        return res.render("user/sites/login", {
          messageError: "Thông tin đăng nhập không chính xác",
          formData: {
            email: formData.email,
          },
        });
      }
      User.findOne({ email: formData.email }).then((user) => {
        req.session.role = user.role;
        req.session.name = user.name;
        req.session.idUser = userLogin.idUser;
        return res.redirect("/me");
      });
    });
  }
  updateProfile(req, res, next) {
    const formData = req.body;
    User.updateOne({ _id: req.session.idUser }, formData).then(() => {
      res.redirect("/me");
    });
  }
  storeAddress(req, res, next) {
    const formData = req.body;
    const user = new User(formData);
    User.updateOne(
      { _id: req.session.idUser },
      { $push: { shipmentDetail: formData } }
    ).then(() => {
      res.redirect("/me/address");
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
