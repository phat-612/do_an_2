class SiteController {
  index(req, res) {
    res.send("home");
  }
}
module.exports = new SiteController();
