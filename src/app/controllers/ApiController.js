const Category = require("../models/Category");
const Warranty = require("../models/Warranty");
const Product = require("../models/Product");
const UserLogin = require("../models/UserLogin");
const User = require("../models/User");
const Banner = require("../models/Banner");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const PDFDocument = require("pdfkit");

// ------------------------
require("dotenv").config();
const { sortObject } = require("../../util/function");
const { response } = require("express");

class ApiController {
  // api user,admin
  // api user

  // aip admin

  // tạo sản phẩm
  createProduct(req, res, next) {
    const formData = req.body;
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => {
        return file.filename;
      });
    }
    formData.images = images;

    // Kiểm tra và xử lý các biến thể (variations)
    if (Array.isArray(formData.variations)) {
      formData.variations = formData.variations
        .filter((variation) => variation.quantity !== "0") // Lọc các variations có quantity bằng 0
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
  updateProduct(req, res, next) {
    Product.findById(req.body.id).then((product) => {
      let arrDatabaseImgList = [];
      product.images.forEach((image) => {
        arrDatabaseImgList.push(image);
      });
      let oldImgs = req.body.oldImgs;
      let newImgs = [];
      req.files.forEach((opject) => {
        newImgs.push(opject.filename);
      });

      res.send({
        clientdata: req.body,
        multer: req.files,
        arrDatabaseImgList: arrDatabaseImgList,
        oldImgs: oldImgs,
        newImgs: newImgs,
      });
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
        product.images.forEach((image) => {
          const fullPath = path.join(filePath, image);
          fs.unlinkSync(fullPath);
        });
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
    // return res.send(req.body);
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
    const warranty = new Warranty(formData);
    warranty.save().then(res.redirect("/admin/warranty/show"));
  }
  updateWarranty(req, res, next) {
    Warranty.findOne({ _id: req.params.id }).then((warranty) => {
      warranty.email = req.body.email;
      warranty.name = req.body.name;
      warranty.phone = req.body.phone;
      warranty.address = req.body.address;
      warranty.note = req.body.note;
      if (req.body.details) {
        // Kiểm tra xem req.body.details có tồn tại hay không
        let updatedWarrantyDetails = [];
        req.body.details.forEach((detailReq) => {
          let detail = warranty.details.find(
            (detail) => detail._id.toString() === detailReq.detailId
          );
          if (detail) {
            detail.idProduct = detailReq.idProduct;
            detail.reasonAndPrice = detailReq.reasonAndPrice;
            updatedWarrantyDetails.push(detail);
          } else {
            updatedWarrantyDetails.push(detailReq);
          }
        });
        warranty.details = updatedWarrantyDetails;
      } else {
        req.flash("message", {
          type: "danger",
          message: "Phải có ít nhất 1 sản phẩm trong đơn bảo hành",
        });
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
  createOrder(req, res, next) {
    const formData = req.body;
    const idUser = req.session.idUser;
    const promise = formData.details.map((detail) => {
      return Product.findOne({ "variations._id": detail.idVariation }).then(
        (product) => {
          const variation = product.variations.id(detail.idVariation);
          // kiểm tra số lượng sản phẩm
          if (variation.quantity < detail.quantity) {
            console.log("sản phẩm " + product.name + " không đủ số lượng");
            throw new Error("Sản phẩm " + product.name + " không đủ số lượng");
          }
          let discount;
          if (
            Date.now() > product.discount.startDay &&
            Date.now() < product.discount.endDay
          ) {
            discount = product.discount.percent;
          } else {
            discount = 0;
          }
          // kiểm tra giá sản phẩm
          if (detail.price != (variation.price * (100 - discount)) / 100) {
            console.log("sản phẩm " + product.name + " đã thay đổi giá bán");
            throw new Error(
              "Sản phẩm " + product.name + " đã thay đổi giá bán"
            );
          }
          // trả về thông tin chi tiết đơn hàng
          return {
            idVariation: detail.idVariation,
            quantity: detail.quantity,
            price: detail.price,
            discount,
          };
        }
      );
    });
    Promise.all(promise)
      .then((details) => {
        // cập nhật số lượng sản phẩm và xóa sản phẩm khỏi giỏ hàng
        details.forEach((detail) => {
          Product.updateOne(
            { "variations._id": detail.idVariation },
            { $inc: { "variations.$.quantity": -detail.quantity } }
          ).exec();
          console.log("idVariation", detail.idVariation);
          Cart.updateOne(
            { idUser },
            { $pull: { items: { idVariation: detail.idVariation } } }
          ).exec();
        });
        const total = details.reduce((total, detail) => {
          return (
            total + detail.price * (1 - detail.discount / 100) * detail.quantity
          );
        }, 0);
        const newOrder = new Order({
          idUser,
          note: formData.note,
          total,
          paymentDetail: {
            method: formData.paymentMethod,
            date: new Date(),
            amount: total,
          },
          details,
          shipmentDetail: formData.shipmentDetail,
        });
        newOrder.save().then((order) => {
          if (formData.paymentMethod == "cod") {
            return res.redirect("/me/historyOrder");
          }
          // xử lý thanh toán online
          // tạo url thanh toán
          const idOrder = order._id;
          const amount = order.total;
          const urlPayment = `/api/createPaymentUrl?idOrder=${idOrder}&amount=${amount}`;
          return res.redirect(urlPayment);
        });
      })
      .catch((error) => {
        console.log(error);
        req.flash("message", {
          type: "danger",
          message: error.message,
        });
        return res.redirect("/me/cart");
      });
  }
  cancelOrder(req, res, next) {
    const idOrder = req.body.idOrder;
    console.log("hủy đơn hàng");
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
      console.log("Thanh toán thất bại");
      return Order.updateOne(
        { _id: orderId },
        { "paymentDetail.status": "failed" }
      ).then(() => {
        return res.redirect("/me/historyOrder");
      });
    }

    console.log("Thanh toán thành công");
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
      const urlPayment = `/api/createPaymentUrl?idOrder=${idOrder}&amount=${total}`;
      return res.redirect(urlPayment);
    });
  }
  //quan ly banner
  storeBanner(req, res) {
    const formData = req.body;
    let image = "";
    if (!req.files) {
      res.send("Không tìm thấy ảnh");
    } else {
      image = req.files[0].filename;
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

  editBanner(req, res) {
    Banner.findById(req.params.id).then((banner) => {
      let oldImageFilename = banner.image;

      // Nếu có ảnh mới được tải lên
      if (req.files) {
        // Xóa ảnh cũ nếu có
        if (oldImageFilename) {
          let oldImagePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            "img",
            "uploads",
            oldImageFilename
          );
          //kiểm tra có hay khộng
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        // console.log(oldImageFilename);

        // Cập nhật đường dẫn ảnh mới
        req.body.image = req.files[0].filename;
        // console.log(req.body.image);
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
        const fullPath = path.join(filePath, banner.image);

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath); // delete the file
        }

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
  // trang order
  changeStatus(req, res) {
    Order.findOne({ _id: req.params.id }).then((order) => {
      order.status = req.body.status;
      if (req.body.status == "failed") {
        order.details.forEach((detail) => {
          Product.findOne(
            { "variations._id": detail.idVariation },
            { "variations.$": 1 } //tìm bảng ghi
          ).then((product) => {
            if (!product) {
              console.log("Product not found");
            } else {
              // Tìm variation được chỉ định dựa trên detail.idVariation
              let variation = product.variations.id(detail.idVariation);
              // Nếu tìm thấy variation, cập nhật số lượng
              if (variation) {
                variation.quantity += detail.quantity;
                product.save();
              }
            }
          });
        });
      }
      if (order.paymentDetail.method != "cod") {
        order.save();
        return res.redirect("back");
      }
      if (
        req.body.status == "pending" &&
        order.paymentDetail.status == "pending"
      ) {
        order.paymentDetail.status = "pending";
      }
      if (
        req.body.status == "shipping" &&
        order.paymentDetail.status == "pending"
      ) {
        order.paymentDetail.status = "pending";
      }
      if (
        req.body.status == "success" &&
        order.paymentDetail.status != "failed"
      ) {
        order.paymentDetail.status = "success";
      }
      if (
        req.body.status == "failed" &&
        order.paymentDetail.status != "success"
      ) {
        order.paymentDetail.status = "failed";
      }
      order.save().then(() => {
        return res.redirect("back");
      });
    });
  }
  // phân quyền
  changeHierarchy(req, res) {
    // return res.send(req.body);
    User.findById(req.params.id).then((user) => {
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
  // end api user

  // test api
  testAddProduct(req, res, next) {
    const product = new Product(req.body);
    product.save().then(() => {
      res.json({ status: "success" });
    });
  }
  testSeeBody(req, res, next) {
    res.json(req.body);
  }
}
module.exports = new ApiController();
