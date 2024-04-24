const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
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
    res.render("user/profiles/historyOrder", { layout: "userProfile" });
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
    // Cart.findOne({ idUser: req.session.idUser })
    //   .populate("items.idVariation")
    //   .then((cart) => {
    //     res.render("user/profiles/cart", {
    //       layout: "userProfile",
    //       cart: cart.toObject(),
    //     });
    //   });
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
          "name variations"
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
          return {
            price: variation.price,
            cartQuantity: cartItem.quantity,
            storageQuantity: variation.quantity,
            attributes: variation.attributes,
            name: product.name,
            idVariation: variation._id,
          };
        });
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

      res.render("user/profiles/order", {
        title: "Đặt hàng",
        js: "user/order",
        cart,
      });
    });
  }
}
module.exports = new MeController();
