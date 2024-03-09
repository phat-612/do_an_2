class SiteController {
  index(req, res, next) {
    res.render("user/sites/home");
  }
  login(req, res, next) {
    res.render("user/sites/login");
  }
  signUp(req, res, next) {
    res.render("user/sites/signUp");
  }
  forgotPassword(req, res, next) {
    res.render("user/sites/forgotPassword");
  }
  cart(req, res, next) {
    res.render("user/sites/cart");
  }
}
module.exports = new SiteController();
