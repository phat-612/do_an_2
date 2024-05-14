const mongoose = require("mongoose");

const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
const { getDiscount } = require("../../util/function");
const Order = require("../models/Order");
class MeController {
  profile(req, res, next) {
    User.findOne({ _id: req.session.idUser }).then((user) => {
      req.flash("message", {
        type: "danger",
        message: "Số lượng sản phẩm trong giỏ hàng đã bị thay đổi",
      });
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
      // {
      //   $unwind: "$product",
      // },
      {
        $project: {
          _id: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          name: { $arrayElemAt: ["$product.name", 0] },
          image: {
            $arrayElemAt: [
              {
                $arrayElemAt: ["$product.images", 0],
              },
              0,
            ],
          },
          quantityProduct: { $size: "$details" },
        },
      },
    ]).then((orders) => {
      if (req.query.hasOwnProperty("_filter")) {
        orders = orders.filter(
          (order) => order[req.query.column] == req.query.value
        );
      }
      // return res.json(orders);
      res.render("user/profiles/historyOrder", {
        layout: "userProfile",
        orders,
      });
    });
  }
  detailOrder(req, res, next) {
    Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.idOrder),
          idUser: new mongoose.Types.ObjectId(req.session.idUser),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "details.idVariation",
          foreignField: "variations._id",
          as: "products",
        },
      },
    ]).then((orders) => {
      if (orders.length == 0) {
        return res.render("404");
      }
      const order = orders[0];
      order.details = order.details.map((detail) => {
        let tempProduct = order.products.find((product) => {
          return product.variations.find((variation) => {
            return variation._id.toString() == detail.idVariation.toString();
          });
        });
        let tempVariation = tempProduct.variations.find((variation) => {
          return variation._id.toString() == detail.idVariation.toString();
        });
        return {
          ...detail,
          name: tempProduct.name,
          image: tempProduct.images[0],
          slugProduct: tempProduct.slug,
          variationProduct: tempVariation,
        };
      });
      // return res.json(order);
      res.render("user/profiles/detailOrder", { layout: "userProfile", order });
    });
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
          "name variations discount images"
        );
      });
      let arrIdVariation = cart.items.map((item) =>
        item.idVariation.toString()
      );
      Promise.all(cartItems).then((products) => {
        let isChangeQuantity = false;
        const resCart = products.map((product) => {
          let cartItem;
          let variation = product.variations.find((variation) => {
            if (arrIdVariation.toString().includes(variation._id)) {
              arrIdVariation = arrIdVariation.filter((val) => {
                cartItem = cart.items.find(
                  (item) => item.idVariation == variation._id.toString()
                );
                // xử lý số lượng trong giỏ hàng lớn hơn số lượng trong kho
                if (variation.quantity < cartItem.quantity) {
                  cartItem.quantity = variation.quantity;
                  cart.items.id(cartItem._id).quantity = variation.quantity;
                  isChangeQuantity = true;
                }
                return val !== variation._id.toString();
              });
              return variation;
            }
          });
          let discount = getDiscount(product.discount);
          return {
            price: variation.price * (1 - discount / 100),
            cartQuantity: cartItem.quantity,
            storageQuantity: variation.quantity,
            attributes: variation.attributes,
            name: product.name,
            image: product.images[0],
            idVariation: variation._id,
          };
        });
        cart.save();
        // return res.json(resCart);
        if (isChangeQuantity) {
          res.locals.message = {
            type: "danger",
            message: "Số lượng sản phẩm trong giỏ hàng đã bị thay đổi",
          };
        }
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
