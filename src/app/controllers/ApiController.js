const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const UserLogin = require("../models/UserLogin");
const User = require("../models/User");
const Banner = require("../models/Banner");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const path = require("path");
const moment = require("moment");
const mongoose = require("mongoose");
const crypto = require("crypto");
const querystring = require("qs");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const PDFDocument = require("pdfkit");
const diacritics = require("diacritics");
const slugify = require("slugify");
var pdf = require("pdf-creator-node");
var fs = require("fs");
const nodemailer = require("nodemailer");
const Message = require("../models/Messages");

// ------------------------
require("dotenv").config();
const { sortObject, getDiscount } = require("../../util/function");
const { response } = require("express");
const { removeImgCloudinary } = require("../middlewares/uploadMiddleware");



class ApiController {
  // api user,admin
  // api user

  // aip admin

  // tạo sản phẩm
  async createProduct(req, res, next) {
    const formData = req.body;
    const nameWithoutAccent = diacritics.remove(req.body.name).trim();
    let slug = nameWithoutAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slugRegEx = new RegExp(`^(${slug})((-[0-9]*$)?)$`, "i");
    await Product.find({ slug: slugRegEx }).then((categoriesWithSlug) => {
      if (categoriesWithSlug.length) {
        req.body.slug = `${slug}-${categoriesWithSlug.length + 1}`;
      } else {
        req.body.slug = slug;
      }
    });
    req.body.variations.forEach((variation) => {
      let attributesString = Object.values(variation.attributes).join(" ");
      const nameWithoutAccent = diacritics.remove(attributesString).trim();
      variation.slug = slugify(nameWithoutAccent, {
        lower: true,
        strict: true,
      });
    });

    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => {
        let arrPath = file.path.split("/");
        return arrPath[arrPath.length - 1];
      });
    }
    formData.images = images;

    // Kiểm tra và xử lý các biến thể (variations)
    if (Array.isArray(formData.variations)) {
      formData.variations = formData.variations
        .filter(
          (variation) =>
            variation.quantity !== "0" &&
            variation.price !== "0" &&
            variation.sold != "0"
        ) // Lọc các variations có quantity bằng 0
        .map((variation) => {
          // Xóa các trường attributes rỗng
          if (variation.attributes) {
            for (let key in variation.attributes) {
              if (variation.attributes[key] === "") {
                delete variation.attributes[key];
              }
            }
          }
          return variation;
        });
    }
    const product = new Product(formData);
    product
      .save()
      .then(() => {
        req.flash("message", {
          type: "success",
          message: "Lưu sản phẩm thành công",
        });
        res.redirect("/admin/product");
      })
      .catch(next);
  }

  //cập nhật sản phẩm
  async updateProduct(req, res, next) {
    const formData = req.body;
    let isBusiness;
    if (formData.isBusiness) {
      isBusiness = true;
    } else {
      isBusiness = false;
    }
    const nameWithoutAccent = diacritics.remove(req.body.name).trim();
    let slug = nameWithoutAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slugRegEx = new RegExp(`^(${slug})((-[0-9]*$)?)$`, "i");
    await Product.find({ slug: slugRegEx }).then((categoriesWithSlug) => {
      if (categoriesWithSlug.length) {
        req.body.slug = `${slug}-${categoriesWithSlug.length + 1}`;
      } else {
        req.body.slug = slug;
      }
    });
    req.body.variations.forEach((variation) => {
      let attributesString = Object.values(variation.attributes).join(" ");
      const nameWithoutAccent = diacritics.remove(attributesString).trim();
      variation.slug = slugify(nameWithoutAccent, {
        lower: true,
        strict: true,
      });
    });

    Product.findById(req.body.id)
      .then((product) => {
        if (!product) {
          req.flash("message", {
            type: "error",
            message: "khong ton tai dan pham",
          });
          return res.redirect("back");
        }
        // product.isbusiness = isbusiness;
        const arrDatabaseImgList = product.images || [];
        const oldImgs = req.body.oldImgs || [];
        const oldImgsArray = Array.isArray(oldImgs)
          ? oldImgs
          : Object.values(oldImgs);
        const newImgs = req.files
          ? req.files.map((file) => {
              let arrPath = file.path.split("/");
              return arrPath[arrPath.length - 1];
            })
          : [];

        const imagesToRemove = arrDatabaseImgList.filter(
          (image) => !oldImgsArray.includes(image)
        );

        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "img",
          "uploads"
        );
        const deletePromises = imagesToRemove.map((image) => {
          removeImgCloudinary(image);
          // const fullPath = path.join(filePath, image);
          // return new Promise((resolve, reject) => {
          //   fs.unlink(fullPath, (err) => {
          //     if (err) reject(err);
          //     else resolve();
          //   });
          // });
        });
        return Promise.all(deletePromises).then(() => {
          const updatedImages = oldImgsArray.concat(newImgs);

          if (Array.isArray(formData.variations)) {
            formData.variations = formData.variations
              .filter(
                (variation) =>
                  variation.quantity != "0" || variation.price != "0"
              )
              .map((variation) => {
                if (!variation._id || variation._id === "") {
                  // Tạo một ObjectId mới nếu _id không hợp lệ hoặc rỗng
                  variation._id = new mongoose.Types.ObjectId();
                }
                if (variation.attributes) {
                  for (const key in variation.attributes) {
                    if (variation.attributes[key] === "") {
                      delete variation.attributes[key];
                    }
                  }
                }
                return variation;
              });
          }
          // return res.send(formData);
          // Update the product
          return Product.updateOne(
            { _id: req.body.id },
            {
              name: formData.name,
              description: formData.description,
              idCategory: formData.idCategory,
              variations: formData.variations,
              discount: formData.discount,
              isBusiness: isBusiness,
              images: updatedImages,
              slug,
            }
          );
        });
      })
      .then(() => {
        req.flash("message", {
          type: "success",
          message: "cap nhat san pham thanh cong",
        });
        res.redirect("back");
      })
      .catch((error) => {
        console.error(error);
        req.flash("message", {
          type: "error",
          message: "loi",
        });
        res.redirect("back");
      });
  }
  removeProduct(req, res, next) {
    Product.findOne(req.body).then((product) => {
      const hasNonZeroSold = product.variations.some(
        (variation) => variation.sold !== 0
      ); // kiểm tra xem có ít nhất một phần tử trong mảng thỏa mãn một điều kiện ""variation.sold !== 0" hay không.
      // Nó trả về true nếu có ít nhất một phần tử thỏa mãn điều kiện và false nếu không có phần tử nào thỏa mãn điều kiện.
      if (!hasNonZeroSold) {
        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "img",
          "uploads"
        );

        // xóa ảnh
        product.images.forEach((image) => {
          // const fullPath = path.join(filePath, image);
          // fs.unlinkSync(fullPath);
          removeImgCloudinary(image);
        });

        let arrIdvar = [];

        product.variations.forEach((variation) => {
          arrIdvar.push(variation._id);
        });
        Cart.updateOne(
          {
            "items.idVariation": { $in: arrIdvar },
          },
          {
            $pull: { items: { idVariation: { $in: arrIdvar } } },
          }
        );
        // return res.send(arrIdvar);
        // xóa thuộc tính trong giỏ hàng

        // Nếu tất cả các biến thể đều có sold là 0, xóa sản phẩm
        product.deleteOne({ _id: req.body }).then(() => {
          req.flash("message", {
            type: "success",
            message: "Sản Phẩm đã được xóa thành công!",
          });
          res.redirect("back");
        });
      } else {
        req.flash("message", {
          type: "danger",
          message: "Không thể xóa SP này vì SP này có trong Đơn Hàng",
        });
        return res.redirect("back");
      }
    });
  }
  // thêm danh mục
  storeCategory(req, res, next) {
    const formData = req.body;
    const idParent = formData.idParent || null; // Xử lý giá trị trống và đặt giá trị mặc định là null
    formData.idParent = idParent;
    const lowerCaseName = req.body.name.toLowerCase();
    // Kiểm tra tên trùng lặp cho danh mục con trong cùng một danh mục cha
    const condition = { name: lowerCaseName, idParent: idParent };
    // console.log(condition);
    Category.findOne(condition).then((existingCategory) => {
      if (existingCategory) {
        req.flash("message", {
          type: "danger",
          message: "Danh mục này đã tồn tại!",
        });
        res.redirect("back");
      } else {
        const nameWithoutAccent = diacritics.remove(formData.name);
        let slug = nameWithoutAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        formData.slug = slug;
        const category = new Category(formData);
        category.save().then(() => {
          req.flash("message", {
            type: "success",
            message: "Danh mục con đã được thêm thành công!",
          });
          res.redirect("back");
        });
      }
    });
  }
  // sửa danh mục
  updateCategory(req, res, next) {
    const formData = req.body;
    const idParent = formData.idParent || null;
    formData.idParent = idParent;
    const lowerCaseName = formData.name.toLowerCase();
    const condition = {
      name: lowerCaseName,
      idParent: idParent,
      _id: { $ne: req.params.id },
    };

    Category.findOne(condition).then((existingCategory) => {
      if (existingCategory) {
        req.flash("message", {
          type: "danger",
          message: "Danh mục này đã tồn tại!",
        });
        res.redirect("back");
      } else {
        const nameWithoutAccent = diacritics.remove(formData.name);
        let slug = nameWithoutAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        formData.slug = slug;
        Category.updateOne({ _id: req.params.id }, { $set: formData }).then(
          () => {
            req.flash("message", {
              type: "success",
              message: "Danh mục đã được cập nhật thành công!",
            });
            res.redirect("back");
          }
        );
      }
    });
  }
  // xóa danh mục
  deleteCategory(req, res, next) {
    const hasChildCategory = async (categoryId) => {
      // tìm có danh mục con hay không
      const subCategories = await Category.find({ idParent: categoryId });
      if (subCategories.length > 0) {
        return true;
      }
      return false;
    };
    // id danh mục
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
  searchCategory(req, res) {
    return console.log(req.query);
  }
  // thêm warranty
  storeWarranty(req, res, next) {
    const formData = req.body;
    if (!formData) {
      res.json({
        status: "Thất bại",
        message: "Lỗi khi tạo đơn bảo hành",
      });
    }
    const warranty = new Warranty(formData);
    warranty.save().then(res.redirect("/admin/warranty/show"));
  }
  // đổi trạng thái
  statusWarranty(req, res) {
    let id = req.body.id;
    let status = req.body.status;
    const statusOrder = ["pending", "fixing", "success", "paid"];
    //statusOrder.indexOf(status) vị trí của status , statusOrder.indexOf(warranty.status) vị trí hiện tại
    Warranty.findById(id).then((warranty) => {
      if (statusOrder.indexOf(status) <= statusOrder.indexOf(warranty.status)) {
        res.json({
          status: "error",
          message: "Cập nhật không thành công. Thứ tự trạng thái không hợp lệ.",
        });
      } else {
        return Warranty.updateOne({ _id: id }, { status: status }).then(() => {
          res.json({
            status: "Success",
            message: "Cập nhật thành công",
          });
        });
      }
    });
  }
  // sửa bảo hành
  updateWarranty(req, res, next) {
    // return res.send(req.body);
    Warranty.findOne({ _id: req.params.id }).then((warranty) => {
      warranty.email = req.body.email;
      warranty.name = req.body.name;
      warranty.phone = req.body.phone;
      warranty.address = req.body.address;
      warranty.note = req.body.note;
      if (req.body.details) {
        // Kiểm tra xem req.body.details có tồn tại hay không
        let updatedWarrantyDetails = [];
        // detailReq sản phẩm đã có phải giống với trong modal sản phẩm
        req.body.details.forEach((detailReq) => {
          let detail = warranty.details.find(
            (detail) => detail._id.toString() === detailReq.detailId
          );
          // có sản phẩm
          if (detail) {
            detail.idProduct = detailReq.idProduct;
            detail.reasonAndPrice = detailReq.reasonAndPrice;
            updatedWarrantyDetails.push(detail);
          } else {
            // sản phẩm mới thêm vào
            updatedWarrantyDetails.push(detailReq);
          }
        });
        warranty.details = updatedWarrantyDetails;
      }
      warranty.save().then(() => {
        req.flash("message", {
          type: "success",
          message: "Đơn bảo hành đã được cập nhật",
        });
        res.redirect("/admin/warranty/" + req.params.id + "/deltail");
      });
    });
  }
  // xóa bảo hành
  deleteWarranty(req, res) {
    const warrantyId = req.params.slugWarranty;
    Warranty.findOne({ _id: warrantyId }).then((warranty) => {
      Warranty.deleteOne({ _id: warrantyId }).then(() => {
        res.redirect("back");
      });
    });
  }
  exportWarranty(req, res) {
    const doc = new PDFDocument();
    const outputFilePath = path.join(
      __dirname,
      "../..",
      "file_download",
      "output.pdf"
    );
    doc.pipe(fs.createWriteStream(outputFilePath));
    doc
      .font(
        path.join(__dirname, "../..", "public", "fonts", "times_new_roman.ttf")
      )
      .fontSize(25)
      .text("Some text with an embedded font!", 100, 100);
    doc.end();
    res.send("tao file");
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
        req.session.email = user.email;
        return res.redirect("/me");
      });
    });
  }
  forgotPassword(req, res, next) {
    const email = req.body.email;
    // nếu email không hợp lệ thì return về trang login kèm thông báo
    // nếu email hợp lệ thì gửi email mật khẩu mới cho người dùng
    if (!validator.validate(email)) {
      req.flash("message", {
        type: "danger",
        message: "Email không hợp lệ",
      });
      return res.redirect("/login");
    }
    UserLogin.findOne({ email }).then((userLogin) => {
      if (!userLogin) {
        req.flash("message", {
          type: "danger",
          message: "Email không tồn tại",
        });
        return res.redirect("/login");
      }
      const newPassword = crypto.randomBytes(4).toString("hex");

      const hashPassword = bcrypt.hashSync(
        newPassword,
        parseInt(process.env.SALT_OR_ROUNDS)
      );
      const activationToken = crypto.randomBytes(20).toString("hex");
      const activationLink = `http://${process.env.HOST}:${process.env.PORT}/api/activatePassword?token=${activationToken}&email=${email}`;
      // ---------------
      // Tạo transporter
      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      // Tạo email
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Mật khẩu mới",
        text: `Mật khẩu mới của bạn là: ${newPassword}. ${activationLink}`,
      };

      // Gửi email
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
      });
      // ---------------
      UserLogin.updateOne(
        { email },
        { tempPassword: hashPassword, activationToken }
      ).then(() => {
        req.flash("message", {
          type: "success",
          message: "Mật khẩu mới đã được gửi vào email của bạn",
        });
        res.redirect("/login");
      });
    });
  }
  activatePassword(req, res, next) {
    const { token, email } = req.query;
    UserLogin.findOne({ email }).then((userLogin) => {
      if (!userLogin) {
        req.flash("message", {
          type: "danger",
          message: "Email không tồn tại",
        });
        return res.redirect("/login");
      }
      if (userLogin.activationToken !== token) {
        req.flash("message", {
          type: "danger",
          message: "Link không hợp lệ",
        });
        return res.redirect("/login");
      }
      UserLogin.updateOne(
        { email },
        {
          password: userLogin.tempPassword,
          tempPassword: "",
          activationToken: "",
        }
      ).then(() => {
        req.flash("message", {
          type: "success",
          message: "Kích hoạt mật khẩu thành công",
        });
        return res.redirect("/login");
      });
    });
  }

  updateProfile(req, res, next) {
    const formData = req.body;
    User.updateOne(
      { _id: req.session.idUser },
      {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
      }
    ).then(() => {
      req.session.name = req.body.name;
      res.redirect("/me");
    });
  }
  updatePassword(req, res, next) {
    const formData = req.body;
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
      (product) => {
        if (!product) {
          req.flash("message", {
            type: "danger",
            message: "Sản phẩm không tồn tại",
          });
          return res.redirect("back");
        }
        if (product.isBusiness == false) {
          req.flash("message", {
            type: "danger",
            message: "Sản phẩm ngừng kinh doanh",
          });
          return res.redirect("back");
        }
        const variation = product.variations.id(formData.idVariation);
        if (variation.quantity < formData.quantity) {
          req.flash("message", {
            type: "danger",
            message: "Sản phẩm đã hết hàng",
          });
          return res.redirect("back");
        }
        Cart.findOne({ idUser }).then((cart) => {
          if (!cart) {
            let newCart = new Cart({
              idUser: idUser,
              items: [
                {
                  idVariation: formData.idVariation,
                  quantity: formData.quantity,
                },
              ],
            });
            return newCart.save().then(() => {
              req.flash("message", {
                type: "success",
                message: "Thêm vào giỏ hàng thành công",
              });
              return res.redirect("back");
            });
          }
          if (cart.items.length == 0) {
            cart.items.push({
              idVariation: formData.idVariation,
              quantity: formData.quantity,
            });
          } else {
            let check = false;
            cart.items.forEach((item) => {
              if (item.idVariation == formData.idVariation) {
                item.quantity += parseInt(formData.quantity);
                check = true;
              }
            });
            if (!check) {
              cart.items.push({
                idVariation: formData.idVariation,
                quantity: formData.quantity,
              });
            }
          }
          cart.save().then(() => {
            req.flash("message", {
              type: "success",
              message: "Thêm vào giỏ hàng thành công",
            });
            return res.redirect("back");
          });
        });
      }
    );
  }
  removeItemToCart(req, res, next) {
    const idVariation = req.body.idVariation;
    const idUser = req.session.idUser;
    Cart.findOne({ idUser }).then((cart) => {
      if (!cart) {
        return res.redirect("/cart");
      }
      cart.items = cart.items.filter((item) => item.idVariation != idVariation);
      cart.save().then(() => {
        res.json({
          status: "success",
        });
      });
    });
  }
  updateCartQuantity(req, res, next) {
    const idVariation = req.body.idVariation;
    const quantity = req.body.quantity;
    const idUser = req.session.idUser;
    const action = req.body.action;
    const arrAction = ["increase", "decrease", "update"];
    if (!arrAction.includes(action)) {
      return res.redirect("/cart");
    }
    Cart.findOne({ idUser }).then((cart) => {
      if (!cart) {
        return res.redirect("/cart");
      }
      cart.items.forEach((item) => {
        if (item.idVariation == idVariation) {
          switch (action) {
            case "increase":
              item.quantity++;
              break;
            case "decrease":
              item.quantity--;
              break;
            case "update":
              item.quantity = quantity;
              break;
          }
        }
      });
      cart.save().then(() => {
        res.json({
          status: "success",
          quantity,
          action,
        });
      });
    });
  }
  createOrder = async (req, res, next) => {
    try {
      const formData = req.body;
      const idUser = req.session.idUser;

      // Lấy điểm hiện có của user từ cơ sở dữ liệu
      const user = await User.findOne({ _id: idUser });
      const userPoints = user.point || 0;

      // Xử lý từng sản phẩm trong đơn hàng
      const details = await Promise.all(
        formData.details.map(async (detail) => {
          const product = await Product.findOne({
            "variations._id": detail.idVariation,
          });
          const variation = product.variations.id(detail.idVariation);

          // Kiểm tra số lượng sản phẩm
          if (variation.quantity < detail.quantity) {
            throw new Error(`Sản phẩm "${product.name}" không đủ số lượng`);
          }

          // Kiểm tra giá sản phẩm
          const discount = getDiscount(product.discount);
          const expectedPrice = Math.ceil(
            (variation.price * (100 - discount)) / 100
          );
          if (Math.ceil(detail.price) !== expectedPrice) {
            throw new Error(`Sản phẩm "${product.name}" đã thay đổi giá bán`);
          }

          // Trả về chi tiết sản phẩm
          return {
            idVariation: detail.idVariation,
            quantity: detail.quantity,
            price: variation.price,
            discount,
            point: detail.point,
          };
        })
      );

      // Cập nhật số lượng sản phẩm và xóa sản phẩm khỏi giỏ hàng
      await Promise.all(
        details.map(async (detail) => {
          await Product.updateOne(
            { "variations._id": detail.idVariation },
            { $inc: { "variations.$.quantity": -detail.quantity } }
          );
          await Cart.updateOne(
            { idUser },
            { $pull: { items: { idVariation: detail.idVariation } } }
          );
        })
      );

      // Tính tổng giá trị đơn hàng và tổng điểm
      const total = details.reduce(
        (sum, detail) =>
          sum + detail.price * (1 - detail.discount / 100) * detail.quantity,
        0
      );

      const totalPoint = details.reduce(
        (sum, detail) => sum + parseInt(detail.point),
        0
      );

      // Áp dụng giảm giá theo điểm nếu có
      let finalTotal = total;
      let pointsToUse = 0;
      if (formData.useDiscountPoint === "true") {
        const maxDiscount = total * 0.1; // Tối đa 10% giá trị đơn hàng
        pointsToUse = Math.min(userPoints, maxDiscount);
        finalTotal -= pointsToUse;

        // Trừ điểm của user trong cơ sở dữ liệu
        await User.updateOne(
          { _id: idUser },
          { $inc: { point: -pointsToUse } }
        );
      }
      // Tạo đơn hàng mới
      const newOrder = new Order({
        idUser,
        note: formData.note.substring(0, 200),
        total: finalTotal,
        point: totalPoint,
        pointsToUse,
        paymentDetail: {
          method: formData.paymentMethod,
          date: new Date(),
          amount: finalTotal,
        },
        details,
        shipmentDetail: formData.shipmentDetail,
      });

      const order = await newOrder.save();
      const adminNamespace = req.io.of('/admin');
      adminNamespace.emit('notify', {
        type: 'success',
        color: '#28a745',
        message: `Đơn hàng mới từ ${order.shipmentDetail.name}`,
      });
      // Xử lý thanh toán
      if (formData.paymentMethod === "cod") {
        req.flash("message", {
          type: "success",
          message: "Đặt hàng thành công !!!",
        });
        return res.redirect("/me/historyOrder");
      } else {
        // Tạo URL thanh toán online
        const urlPayment = `/api/user/createPaymentUrl?idOrder=${order._id}&amount=${order.total}`;
        return res.redirect(urlPayment);
      }
    } catch (error) {
      console.error(error);
      req.flash("message", {
        type: "danger",
        message: error.message,
      });
      return res.redirect("/me/cart");
    }
  };
  cancelOrder(req, res, next) {
    const idOrder = req.body.idOrder;
    Order.findOne({ _id: idOrder }).then((order) => {
      if (order.status != "pending") {
        req.flash("message", {
          type: "danger",
          message: "Không thể hủy đơn hàng này",
        });
        return res.redirect("back");
      }
      const detailsOrder = order.details;
      // bất đồng bộ cập nhật số lượng sản phẩm
      detailsOrder.forEach((detail) => {
        Product.findOne({ "variations._id": detail.idVariation }).then(
          (product) => {
            const variation = product.variations.id(detail.idVariation);
            variation.quantity += detail.quantity;
            product.save();
          }
        );
      });
      order.status = "cancel";
      order.paymentDetail.status = "cancel";
      order.save().then(() => {
        req.flash("message", {
          type: "success",
          message: "Hủy đơn hàng thành công",
        });
        return res.redirect("back");
      });
    });
  }
  creatPaymentUrl(req, res, next) {
    const idOrder = req.query.idOrder;
    const amountOder = req.query.amount;
    // return console.log(idOrder, amount);
    Order.findOne({ _id: idOrder }).then((order) => {
      if (!order) {
        return res.redirect("/me/historyOrder");
      }
      process.env.TZ = "Asia/Ho_Chi_Minh";

      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let tmnCode = process.env.vnp_TmnCode;
      let secretKey = process.env.vnp_HashSecret;
      let vnpUrl = process.env.vnp_Url;
      let returnUrl = process.env.vnp_ReturnUrl;
      let orderId = idOrder;
      let amount = amountOder;
      let bankCode = "";

      let locale = "vn";
      if (locale === null || locale === "") {
        locale = "vn";
      }
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = `${orderId}-${createDate}`;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      res.redirect(vnpUrl);
    });
  }
  returnPayment(req, res, next) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.vnp_HashSecret;

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    const isTrust = secureHash == signed;
    const transactionStatus = vnp_Params["vnp_TransactionStatus"];
    let orderId = vnp_Params["vnp_TxnRef"].split("-")[0];
    if (!isTrust || transactionStatus != "00") {
      return Order.updateOne(
        { _id: orderId },
        { "paymentDetail.status": "failed" }
      ).then(() => {
        return res.redirect("/me/historyOrder");
      });
    }
    Order.updateOne(
      { _id: orderId },
      { "paymentDetail.status": "success" }
    ).then(() => {
      return res.redirect("/me/historyOrder");
    });
  }
  rePayment(req, res, next) {
    const idOrder = req.body.idOrder;
    Order.findOne({ _id: idOrder }).then((order) => {
      const total = order.total;
      const urlPayment = `/api/user/createPaymentUrl?idOrder=${idOrder}&amount=${total}`;
      return res.redirect(urlPayment);
    });
  }
  ratingProduct(req, res, next) {
    const formData = req.body;
    const idUser = req.session.idUser;
    const idProduct = formData.idProduct;
    if (formData.rating < 1 || formData.rating > 5) {
      req.flash("message", {
        type: "danger",
        message: "Đánh giá không hợp lệ",
      });
      return res.redirect("back");
    }
    Product.findOne({ _id: idProduct }).then((product) => {
      if (!product) {
        return res.redirect("back");
      }
      product.reviews.push({
        idUser,
        rating: Math.ceil(formData.rating),
        comment: formData.comment.substring(0, 250),
      });
      product.save().then(() => {
        const adminNamespace = req.io.of('/admin');
        adminNamespace.emit("notify", {
          type: "success",
          color: '#ffc107',
          message: `Có đánh giá mới từ ${req.session.name}`,
        });
        req.flash("message", {
          type: "success",
          message: "Đánh giá thành công !!!",
        });
        return res.redirect("back");
      });
    });
  }
  accessReview(req, res, next) {
    const idReview = req.body.idReview;
    const action = req.body.action;
    const arrAction = ["accept", "reject"];
    if (!arrAction.includes(action)) {
      return res.redirect("back");
    }
    Product.findOne({ "reviews._id": idReview }).then((product) => {
      if (!product) {
        return res.redirect("back");
      }
      if (action == "accept") {
        product.reviews.id(idReview).status = true;
      } else {
        product.reviews.pull({ _id: idReview });
      }
      product.save().then(() => {
        return res.redirect("back");
      });
    });
  }
  // bình luận sản phẩm
  commentProduct(req, res, next) {
    const formData = req.body;
    const idUser = req.session.idUser;
    const role = req.session.role;
    const idProduct = formData.idProduct;
    Product.findOne({ _id: idProduct }).then((product) => {
      if (!product) {
        return res.redirect("back");
      }
      product.comments.push({
        idUser,
        isAdmin: role === "admin",
        status: role === "admin",
        comment: formData.comment.substring(0, 250),
      });
      product.save().then(() => {
        if (role == "user"){
          const adminNamespace = req.io.of('/admin');
          adminNamespace.emit('notify', {
            type: 'success',
            color: '#fd7e14',
            message: `Có bình luận mới từ ${req.session.name}`,
          });
        }
        req.flash("message", {
          type: "success",
          message: "Bình luận thành công !!!",
        });
        return res.redirect("back");
      });
    });
  }
  // trả lời bình luận
  answerComment(req, res, next) {
    const formData = req.body;
    const role = req.session.role;
    const idUser = req.session.idUser;
    const idProduct = formData.idProduct;
    const idComment = formData.idComment;
    Product.findOne({ _id: idProduct }).then((product) => {
      if (!product) {
        return res.redirect("back");
      }
      product.comments.id(idComment).answers.push({
        idUser,
        comment: formData.comment.substring(0, 250),
        isAdmin: role === "admin",
      });
      product.comments.id(idComment).status = role === "admin";
      product.comments.id(idComment).timeUpdate = new Date();
      product.save().then(() => {
        if (role == "user"){
          const adminNamespace = req.io.of('/admin');
          adminNamespace.emit('notify', {
            type: 'success',
            color: '#fd7e14',
            message: `Có bình luận mới từ ${req.session.name}`,
          });
        }
        return res.redirect("back");
      });
    });
  }
  nextComment(req, res, next) {
    const role = req.session.role;
    const formData = req.body;
    const idProduct = formData.idProduct;
    const idComment = formData.idComment;
    if (role == "admin") {
      Product.updateOne(
        { _id: idProduct, "comments._id": idComment },
        { $set: { "comments.$.status": true } }).then(() => {
          return res.redirect("back");
        }).catch((err) => {
          console.error("Error updating comment status:", err);
          return res.status(500).send("Error updating comment status");
        });
    }
  }
  //quan ly banner
  storeBanner(req, res) {
    const formData = req.body;
    let image = "";
    if (!req.files) {
      res.send("Không tìm thấy ảnh");
    } else {
      // image = req.files[0].filename;
      let arrPath = req.files[0].path.split("/");
      image = arrPath[arrPath.length - 1];
    }
    // console.log(image);
    formData.image = image;
    const newBanner = new Banner(formData);
    newBanner.save().then(() => {
      req.flash("message", {
        type: "success",
        message: "Thêm Banner thành công",
      });
      res.redirect("back");
    });
  }
  // đổi trạng thái banner
  changeBanner(req, res) {
    let status;
    if (req.body.status) {
      status = true;
    } else {
      status = false;
    }
    Banner.findById(req.params.id).then((banner) => {
      banner.status = status;
      banner.save().then(() => {
        req.flash("message", {
          type: "success",
          message: "Đổi trạng thái thành công",
        });
        res.redirect("back");
      });
    });
  }
  // sửa banner
  editBanner(req, res) {
    Banner.findById(req.params.id).then((banner) => {
      let oldImageFilename = banner.image;

      // Nếu có ảnh mới được tải lên
      if (req.files && req.files.length > 0) {
        // Xóa ảnh cũ nếu có
        if (oldImageFilename) {
          // let oldImagePath = path.join(
          //   __dirname,
          //   "..",
          //   "..",
          //   "public",
          //   "img",
          //   "uploads",
          //   oldImageFilename
          // );
          // //kiểm tra có hay không
          // if (fs.existsSync(oldImagePath)) {
          //   fs.unlinkSync(oldImagePath);
          // }
          removeImgCloudinary(oldImageFilename);
        }

        // Cập nhật đường dẫn ảnh mới
        // req.body.image = req.files[0].filename;
        let arrPath = req.files[0].path.split("/");
        req.body.image = arrPath[arrPath.length - 1];
      } else {
        // Nếu không có ảnh mới, giữ nguyên ảnh cũ
        req.body.image = oldImageFilename;
      }

      // Cập nhật banner sau cùng
      Banner.updateOne({ _id: req.params.id }, { $set: req.body })
        .then(() => {
          res.redirect("back");
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send({
            message: "Đã xảy ra lỗi trong quá trình cập nhật banner.",
          });
        });
    });
  }
  // xóa banner
  deleteBanner(req, res) {
    const Id = req.params.id;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "img",
      "uploads"
    );

    Banner.findOne({ _id: Id }).then((banner) => {
      if (!banner) {
        res.send("không tìm thấy");
      } else {
        // //tên hình
        // const fullPath = path.join(filePath, banner.image);
        // // console.log(fullPath);
        // if (fs.existsSync(fullPath)) {
        //   fs.unlinkSync(fullPath); // delete the file
        // }
        removeImgCloudinary(banner.image);

        Banner.deleteOne({ _id: Id }).then(() => {
          req.flash("message", {
            type: "danger",
            message: "Xóa thành công",
          });
          res.redirect("back");
        });
      }
    });
  }
  // đổi trạng thái trang order
  async changeStatus(req, res) {
    try {
      const order = await Order.findOne({ _id: req.params.id });
      if (!order) {
        req.flash("message", {
          type: "danger",
          message: "Đơn hàng không tồn tại",
        });
        return res.redirect("back");
      }

      // Kiểm tra trạng thái không hợp lệ
      if (
        (order.status === "shipping" && req.body.status === "pending") ||
        ["success", "failed"].includes(order.status)
      ) {
        req.flash("message", {
          type: "danger",
          message: "Thay đổi trạng thái không thành công",
        });
        return res.redirect("back");
      }

      // Cập nhật trạng thái
      order.status = req.body.status;

      if (req.body.status === "failed") {
        const pointsToUse = order.pointsToUse || 0;

        // Hoàn trả điểm cho người dùng
        await User.updateOne(
          { _id: order.idUser },
          { $inc: { point: pointsToUse } }
        );

        const updates = order.details.map(async (detail) => {
          try {
            // Hoàn trả số lượng sản phẩm
            await Product.updateOne(
              { "variations._id": detail.idVariation },
              { $inc: { "variations.$.quantity": detail.quantity } }
            );
          } catch (error) {
            console.error(`Lỗi xử lý chi tiết đơn hàng ${detail._id}:`, error);
          }
        });

        // Chờ tất cả các thao tác cập nhật hoàn thành
        await Promise.all(updates);
      } else if (req.body.status === "success") {
        const userUpdated = await User.updateOne(
          { _id: order.idUser },
          { $inc: { point: order.point || 0 } }
        );

        if (userUpdated.modifiedCount > 0) {
          const updates = order.details.map(async (detail) => {
            await Product.updateOne(
              { "variations._id": detail.idVariation },
              { $inc: { "variations.$.sold": detail.quantity } }
            );
          });

          await Promise.all(updates);
        }
      }

      // Cập nhật trạng thái thanh toán
      if (order.paymentDetail.method !== "cod") {
        switch (req.body.status) {
          case "pending":
          case "shipping":
            if (order.paymentDetail.status === "pending") {
              order.paymentDetail.status = "pending";
            }
            break;
          case "success":
            if (order.paymentDetail.status !== "failed") {
              order.paymentDetail.status = "success";
            }
            break;
          case "failed":
            if (order.paymentDetail.status !== "success") {
              order.paymentDetail.status = "failed";
            }
            break;
        }
      }

      // Lưu thay đổi
      await order.save();

      req.flash("message", {
        type: "success",
        message: "Thay đổi trạng thái thành công",
      });
      res.redirect("back");
    } catch (error) {
      console.error("Error changing order status:", error);
      req.flash("message", {
        type: "danger",
        message: "Đã xảy ra lỗi, vui lòng thử lại",
      });
      res.redirect("back");
    }
  }
  // order admin

  // phân quyền
  changeHierarchy(req, res) {
    // return res.send(req.body);
    User.findById(req.params.id).then((user) => {
      if (user.role === "admin" && req.params.id === req.session.idUser) {
        req.flash("message", {
          type: "danger",
          message: "Không thể thay đổi vai trò từ admin sang user",
        });
        return res.redirect("back");
      }
      user.role = req.body.role;
      user.save().then(() => {
        req.flash("message", {
          type: "success",
          message: "Phân quyên thành công",
        });
        res.redirect("back");
      });
    });
  }
  meMessages(req, res) {
    const id = req.session.idUser;
    Message.find({ sender: id })
      .then((messages) => {
        // Xử lý danh sách tin nhắn
        const formattedMessages = messages.flatMap((msg) =>
          msg.message.map((innerMsg) => ({
            content: innerMsg.content, // Lấy nội dung tin nhắn
            receiver: innerMsg.receiver || null, // Xác định người nhận
            timestamp: innerMsg.timestamp, // Định dạng lại timestamp
          }))
        );

        // Trả về danh sách tin nhắn đã định dạng
        res.json(formattedMessages);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Unable to fetch messages." });
      });
  }
  allMessages(req, res) {
    const id = req.params.id;
    Message.find({ sender: id })
      .populate({
        path: "message.sender", // Populating người gửi trong mảng message
        select: "name", // Chỉ lấy tên người gửi
      }) // Populating tên người gửi
      .then((messages) => {
        const allMessages = messages.flatMap((msg) => {
          // Lọc các tin nhắn hợp lệ từ phòng chat
          const filteredMessages = msg.message.filter(
            (message) => message.room.toString() === id
          );

          // Nếu có tin nhắn hợp lệ thì trả về thông tin
          return filteredMessages.map((message) => ({
            userName: message.sender,
            content: message.content,
            receiver: message.receiver || null,
            timestamp: message.timestamp, // Thời gian
          }));
        });
        res.json(allMessages); // Trả về tất cả tin nhắn đã xử lý
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Có lỗi xảy ra khi lấy tin nhắn" });
      });
  }
  // end api user

  // test api
  testAddProduct(req, res, next) {
    const product = new Product(req.body);
    product.save().then(() => {
      res.json({ status: "success" });
    });
  }
  testSeeBody(req, res, next) {
    console.log(req.files);
    console.log(req.body);
    res.send(req.body);
  }
}
module.exports = new ApiController();
