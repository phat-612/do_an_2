const mongoose = require("mongoose");

const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
const Order = require("../models/Order");
class MeController {
  profile(req, res, next) {
    User.findOne({ _id: req.session.idUser }).then((user) => {
      res.render("user/profiles/profile", {
        layout: "userProfile",
        js: "user/profile",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          birthday: user.birthday,
          createdAt: user.createdAt,
        },
      });
    });
  }
  historyOrder(req, res, next) {
    // tên, ảnh giá, của một sản phẩm đầu tiên, thời gian
    const idUser = req.session.idUser;
    Order.aggregate([
      {
        $match: { idUser: new mongoose.Types.ObjectId(idUser) },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "products",
          localField: "details.idVariation",
          foreignField: "variations._id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          name: "$product.name",
          image: { $arrayElemAt: ["$product.images", 0] },
          quantityProduct: { $size: "$details" },
        },
      },
    ]).then((orders) => {
      res.render("user/profiles/historyOrder", {
        layout: "userProfile",
        orders,
      });
    });
  }
  detailOrder(req, res, next) {
    res.render("user/profiles/detailOrder", { layout: "userProfile" });
  }
  historyWaranty(req, res, next) {
    res.render("user/profiles/historyWaranty", { layout: "userProfile" });
  }
  detailWaranty(req, res, next) {
    res.render("user/profiles/detailWaranty", { layout: "userProfile" });
  }
  changePassword(req, res, next) {
    res.render("user/profiles/changePassword", { layout: "userProfile" });
  }
  address(req, res, next) {
    User.findOne({ _id: req.session.idUser }).then((user) => {
      res.render("user/profiles/address", {
        layout: "userProfile",
        js: "user/address",
        addresses: multipleMongooseToObject(user.shipmentDetail),
      });
    });
  }
  cart(req, res, next) {
    Cart.findOne({ idUser: req.session.idUser }).then((cart) => {
      if (!cart) {
        return res.render("user/profiles/cart", {
          layout: "userProfile",
          js: "user/cart",
          cart: [],
        });
      }
      const cartItems = cart.items.map((item) => {
        return Product.findOne({ "variations._id": item.idVariation }).select(
          "name variations discount"
        );
      });
      let arrIdVariation = cart.items.map((item) =>
        item.idVariation.toString()
      );
      Promise.all(cartItems).then((products) => {
        const resCart = products.map((product) => {
          let cartItem;
          let variation = product.variations.find((variation) => {
            if (arrIdVariation.toString().includes(variation._id)) {
              arrIdVariation = arrIdVariation.filter((val) => {
                cartItem = cart.items.find(
                  (item) => item.idVariation == variation._id.toString()
                );
                return val !== variation._id.toString();
              });
              return variation;
            }
          });
          let discount;
          if (
            Date.now() > product.discount.startDay &&
            Date.now() < product.discount.endDay
          ) {
            discount = product.discount.percent;
          } else {
            discount = 0;
          }
          return {
            price: variation.price * (1 - discount / 100),
            cartQuantity: cartItem.quantity,
            storageQuantity: variation.quantity,
            attributes: variation.attributes,
            name: product.name,
            idVariation: variation._id,
          };
        });
        // return res.json(resCart);
        res.render("user/profiles/cart", {
          layout: "userProfile",
          js: "user/cart",
          cart: resCart,
        });
      });
    });
  }
  order(req, res, next) {
    const carts = JSON.parse(req.cookies.cart);
    // hinh, giá, check soluong, ten, phan loai
    let promises = carts.map((cookieCart) => {
      return Promise.all([
        Product.findOne({ "variations._id": cookieCart.idVariation }),
        Cart.findOne({ idUser: req.session.idUser }),
      ]).then(([product, cart]) => {
        let data = {};
        data.name = product.name;
        data.image = product.images[0];
        let variation = product.variations.find(
          (variation) => variation._id.toString() == cookieCart.idVariation
        );
        if (
          Date.now() > product.discount.startDay &&
          Date.now() < product.discount.endDay
        ) {
          data.price = variation.price * (1 - product.discount.percent / 100);
        } else {
          data.price = variation.price;
        }
        if (variation.quantity < cart.quantity) {
          data.error = "Số lượng sản phẩm không đủ";
          data.quantity = variation.quantity;
        } else {
          data.quantity = cookieCart.quantity;
        }
        data.variation = variation.attributes;
        data.idVariation = variation._id;
        return data;
      });
    });

    Promise.all(promises).then((resData) => {
      let cart = {};
      cart.items = resData;
      cart.totalPrice = resData.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
      User.findOne({ _id: req.session.idUser }).then((user) => {
        const shipmentDetail = user.shipmentDetail.map(
          (detail) => (detail = detail.toObject())
        );
        res.render("user/profiles/order", {
          title: "Đặt hàng",
          js: "user/order",
          cart,
          shipmentDetail,
        });
      });
    });
  }
}
module.exports = new MeController();
