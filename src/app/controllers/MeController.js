const { multipleMongooseToObject } = require("../../util/mongoose");
class MeController {
  profile(req, res, next) {
    res.render("user/profiles/info", { layout: "userProfile" });
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
    res.render("user/profiles/address", { layout: "userProfile" });
  }
}
module.exports = new MeController();
