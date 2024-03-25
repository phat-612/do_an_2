const User = require("../models/User");

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
        addresses: multipleMongooseToObject(user.shipmentDetail),
      });
    });
  }
}
module.exports = new MeController();
