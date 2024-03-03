class AdminController {
  // get /
  index(req, res) {
    res.render("admin/sites/home", { layout: "admin", js: "admin/header" });
  }
  // get /product
  product(req, res) {
    res.render("admin/products/showProduct", {
      layout: "admin",
      js: "admin/showProduct",
      css: "admin/showProduct",
    });
  }
}
module.exports = new AdminController();
