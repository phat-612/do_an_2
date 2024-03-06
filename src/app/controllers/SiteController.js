class SiteController {
  index(req, res) {
    res.render("user/sites/home");
  }
}
module.exports = new SiteController();
