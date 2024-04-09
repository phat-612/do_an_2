const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const UserLogin = require("../models/UserLogin");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Fs = require("fs");
const path = require("path");
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
        res.redirect("back");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  deleteCategory(req, res, next) {}
  storeWarranty(req, res, next) {
    const formData = req.body;
    // res.send(formData);
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => {
        return file.filename;
      });
    }
    formData.images = images;

    let uniqueDataArray = [];
    uniqueDataArray.push(formData);

    uniqueDataArray.forEach((data) => {
      const warranty = new Warranty(data);
      Warranty.findOne({ "details.idProduct": data.details[0].idProduct }).then(
        (existingWarranty) => {
          if (!existingWarranty) {
            // Bản ghi không tồn tại, lưu vào CSDL
            warranty.save().then(() => {});
          }
        }
      );
    });

    // Chèn dữ liệu đã được kiểm tra và loại bỏ vào collection
    Warranty.insertMany(uniqueDataArray, { ordered: false }).then(() => {
      res.redirect("/admin/warranty/show");
    });
  }
  async updateWarranty(req, res, next) {
    // try {
    //   let warranty = await Warranty.findById(req.params.id);
    //   if (!warranty) {
    //     res.status(404).send("Không tìm thấy Warranty");
    //     return;
    //   }

    //   let productIndex = warranty.details.findIndex(
    //     (detail) => detail.idProduct.toString() === req.body.idProduct
    //   );

    //   if (productIndex !== -1) {
    //     warranty.details[productIndex] = req.body;
    //   } else {
    //     res.status(400).send("Không tìm thấy sản phẩm trong Warranty");
    //     return;
    //   }

    //   await warranty.save();
    //   res.redirect("/admin/warranty/show");
    // } catch (err) {
    //   console.log(err);
    //   res.status(500).send("Có lỗi xảy ra trong quá trình cập nhật Warranty");
    //   next(err);
    // }
    res.json(req.body);
  }
  deleteWarranty(req, res) {
    const warrantyId = req.params.slugWarranty;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "img",
      "uploads"
    );

    Warranty.findOne({ _id: warrantyId }).then((warranty) => {
      warranty.images.forEach((image) => {
        const fullPath = path.join(filePath, image);
        // try {
        Fs.unlinkSync(fullPath); // try to delete the file
        // } catch {}
      });

      Warranty.deleteOne({ _id: warrantyId }).then(() => {
        res.redirect("back");
      });
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
  addItemToCart(req, res, next) {
    const formData = req.body;
    const idUser = req.session.idUser;
    Product.findOne({ "variations._id": formData.idVariation }).then(
      (variation) => {
        res.send(variation);
      }
    );
    // Cart.findOne({ idUser }).then((cart) => {
    //   if (!cart) {
    //     let newCart = new Cart({
    //       idUser: idUser,
    //       items: [
    //         {
    //           idVariation: formData.idVariation,
    //           quantity: formData.quantity,
    //         },
    //       ],
    //     });
    //     newCart.save().then(() => {
    //       res.redirect("/cart");
    //     });
    //   } else {
    //     let check = false;
    //     cart.items.forEach((item) => {
    //       if (item.idVariation == formData.idVariation) {
    //         item.quantity += parseInt(formData.quantity);
    //         check = true;
    //       }
    //     });
    //     if (!check) {
    //       cart.items.push({
    //         idVariation: formData.idVariation,
    //         quantity: formData.quantity,
    //       });
    //     }
    //     cart.save().then(() => {
    //       res.redirect("/cart");
    //     });
    //   }
    // });
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
