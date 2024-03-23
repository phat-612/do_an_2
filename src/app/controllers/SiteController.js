class SiteController {
  index(req, res, next) {
    res.render("user/sites/home");
  }
  login(req, res, next) {
    res.render("user/sites/login");
  }
  signUp(req, res, next) {
    res.render("user/sites/signUp", {
      js: "user/signUp",
    });
  }
  cart(req, res, next) {
    res.render("user/sites/cart");
  }
}
module.exports = new SiteController();
