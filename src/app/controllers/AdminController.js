class AdminController {
  index(req, res) {
    res.render("admin/sites/home", { layout: "admin" });
  }
}
module.exports = new AdminController();
