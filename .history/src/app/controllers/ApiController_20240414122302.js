const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const UserLogin = require("../models/UserLogin");
const User = require("../models/User");
const Cart = require("../models/Cart");
const fs = require("fs");
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

  // create product
  createProduct(req, res, next) {
    const formData = req.body;
  }

  storeCategory(req, res, next) {
    const formData = req.body;
    const idParent = formData.idParent || null; // Xử lý giá trị trống và đặt giá trị mặc định là null
    formData.idParent = idParent;

    const category = new Category(formData);
    category.save().then(() => {
      req.flash("message", {
        type: "success",
        message: "Danh mục đã được thêm thành công!",
      });
      res.redirect("back");
    });
  }
  updateCategory(req, res, next) {
    const idParent = req.body.idParent || null;
    req.body.idParent = idParent;

    Category.updateOne({ _id: req.params.id }, { $set: req.body })
      .exec()
      .then(() => {
        req.flash("message", {
          type: "success",
          message: "Danh mục đã được cập nhật thành công!",
        });
        res.redirect("back");
      });
  }
  deleteCategory(req, res, next) {
    const hasChildCategory = async (categoryId) => {
      const subCategories = await Category.find({ idParent: categoryId });
      if (subCategories.length > 0) {
        return true;
      }
      return false;
    };

    // Logic xóa danh mục
    const categoryId = req.params.slugCategory;

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    Product.countDocuments({ idCategory: categoryId }).then(async (count) => {
      // console.log(count);
      // Nếu có sản phẩm thuộc danh mục này
      if (count > 0) {
        req.flash("message", {
          type: "danger",
          message:
            "Không thể xóa danh mục này vì vẫn còn sản phẩm trong danh mục",
        });
        return res.redirect("back");
      }

      // Kiểm tra xem danh mục này có phải danh mục cha (có danh mục con) không
      const hasChild = await hasChildCategory(categoryId);
      // console.log(hasChild);
      if (hasChild) {
        req.flash("message", {
          type: "danger",
          message: "Không thể xóa danh mục này vì vẫn còn danh mục con",
        });
        return res.redirect("back");
      }

      // Nếu không có sản phẩm liên quan và không có danh mục con, tiến hành xóa danh mục
      Category.findOneAndDelete({ _id: categoryId }).then(() => {
        req.flash("message", {
          type: "success",
          message: "Danh mục đã được xóa thành công.",
        });
        res.redirect("back");
      });
    });
  }
  storeWarranty(req, res, next) {
    const formData = req.body;

    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => {
        return file.filename;
      });
    }

    formData.images = images;

    const warranty = new Warranty(formData);
    warranty.save();

    res.redirect("/admin/warranty/show");
  }
  async updateWarranty(req, res, next) {
    const products = await Product.find({});
    res.render("admin/warrantys/edit-warranty", {
      layout: "admin",
      products: multipleMongooseToObject(products),
    });
    console.log(products);
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
        fs.unlinkSync(fullPath); // try to delete the file
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
    console.log("thêm sản phẩm");
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
