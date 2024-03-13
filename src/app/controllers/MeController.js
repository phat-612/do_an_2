const { multipleMongooseToObject } = require("../../util/mongoose");
class MeController {
  profile(req, res, next) {
    res.render("user/profiles/info", { layout: "userProfile" });
  }
  history(req, res, next) {
    res.render("user/profiles/history", { layout: "userProfile" });
  }
  address(req, res, next) {
    res.render("user/profiles/address", { layout: "userProfile" });
  }
}
module.exports = new MeController();
