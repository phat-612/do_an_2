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
    // res.send(formData);
    const formData = req.body;
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => {
        return file.filename;
      });
    }
    formData.images = images;

    const warrantyDataArray = [formData];

    // Kiểm tra và loại bỏ các bản ghi trùng lặp hoặc có idProduct là null
    const uniqueDataArray = warrantyDataArray.filter((data, index, self) => {
      if (
        data.details &&
        Array.isArray(data.details) &&
        data.details.length > 0 &&
        data.details[0].idProduct !== null
      ) {
        const currentIndex = self.findIndex(
          (item) =>
            item.details &&
            Array.isArray(item.details) &&
            item.details.length > 0 &&
            item.details[0].idProduct.toString() ===
              data.details[0].idProduct.toString()
        );
        return currentIndex === index;
      }
      return false;
    });
    uniqueDataArray.forEach((data) => {
      const warranty = new Warranty(data);
      Warranty.findOne({ "details.idProduct": data.details[0].idProduct }).then(
        (existingWarranty) => {
          if (existingWarranty) {
            // Bản ghi đã tồn tại, xử lý trường hợp trùng lặp ở đây (ví dụ: ghi log hoặc bỏ qua)
          } else {
            // Bản ghi không tồn tại, lưu vào CSDL
            warranty.save().then((savedWarranty) => {
              console.log("Dữ liệu bảo hành đã được lưu:", savedWarranty);
              // Xử lý sau khi lưu thành công
            });
          }
        }
      );
    });
    // Chèn dữ liệu đã được kiểm tra và loại bỏ vào collection
    Warranty.insertMany(uniqueDataArray, { ordered: false }).then(() => {
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
    console.log(formData);
    User.updateOne(
      { _id: req.session.idUser },
      {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
      }
    ).then(() => {
      res.redirect("/me");
    });
  }
  updatePassword(req, res, next) {
    const formData = req.body;
    console.log(formData);
    UserLogin.findOne({ idUser: req.session.idUser }).then((userLogin) => {
      if (!userLogin) {
        return res.redirect("/login");
      }
      const isMatch = bcrypt.compareSync(formData.oldPw, userLogin.password);
      if (!isMatch) {
        req.flash("message", {
          type: "danger",
          message: "Mật khẩu cũ không chính xác",
        });
        return res.redirect("/me/changePassword");
      }
      if (formData.newPw !== formData.reNewPw) {
        req.flash("message", {
          type: "danger",
          message: "Mật khẩu mới không khớp",
        });
        return res.redirect("/me/changePassword");
      }
      const hashPassword = bcrypt.hashSync(
        formData.newPw,
        parseInt(process.env.SALT_OR_ROUNDS)
      );
      UserLogin.updateOne(
        { idUser: req.session.idUser },
        { password: hashPassword }
      ).then(() => {
        req.flash("message", {
          type: "success",
          message: "Đổi mật khẩu thành công",
        });
        res.redirect("/me/changePassword");
      });
    });
  }
  storeAddress(req, res, next) {
    const formData = req.body;
    if (formData.defaultAddress) {
      User.updateOne(
        { _id: req.session.idUser },
        { $set: { "shipmentDetail.$[].defaultAddress": false } }
      ).exec();
      formData.defaultAddress = true;
    } else {
      formData.defaultAddress = false;
    }
    User.updateOne(
      { _id: req.session.idUser },
      { $push: { shipmentDetail: formData } }
    ).then(() => {
      res.redirect("/me/address");
    });
  }
  updateAddress(req, res, next) {
    const formData = req.body;
    if (formData.defaultAddress) {
      User.updateOne(
        { _id: req.session.idUser },
        { $set: { "shipmentDetail.$[].defaultAddress": false } }
      ).exec();
      formData.defaultAddress = true;
    } else {
      formData.defaultAddress = false;
    }
    User.updateOne(
      { _id: req.session.idUser, "shipmentDetail._id": formData.idAddress },
      {
        $set: {
          "shipmentDetail.$.alias": formData.alias,
          "shipmentDetail.$.name": formData.name,
          "shipmentDetail.$.phone": formData.phone,
          "shipmentDetail.$.address": formData.address,
          "shipmentDetail.$.defaultAddress": formData.defaultAddress,
        },
      }
    ).then(() => {
      res.redirect("/me/address");
    });
  }
  deleteAddress(req, res, next) {
    const idAddress = req.body.idAddress;
    User.updateOne(
      { _id: req.session.idUser },
      { $pull: { shipmentDetail: { _id: idAddress, defaultAddress: false } } }
    ).then((response) => {
      req.flash("message", {
        type: "success",
        message: "Xóa thành công",
      });
      res.redirect("/me/address");
    });
  }
  // end api user
  // test api
  test(req, res, next) {
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
