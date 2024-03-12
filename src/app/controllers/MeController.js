const { multipleMongooseToObject } = require("../../util/mongoose");
class MeController {
  profile(req, res, next) {
    res.render("user/profiles/info", { layout: "userProfile" });
  }
}
module.exports = new MeController();
