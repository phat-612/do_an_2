class SiteController {
  index(req, res) {
    res.render("user/sites/home");
  }
  createWarranty(req, res) {
    res.render("");
  }
}
module.exports = new SiteController();
