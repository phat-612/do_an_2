const { multipleMongooseToObject } = require("../../util/mongoose");
class MeController {
  profile(req, res, next) {
    res.send("profile");
  }
}
module.exports = new MeController();
