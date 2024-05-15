const siteRouter = require("./site");
const apiRouter = require("./api");
const productRouter = require("./product");
const adminRouter = require("./admin");
const meRouter = require("./me");

const {
  userLogin,
  isLoggedIn,
  adminLogin,
} = require("../app/middlewares/authMiddleware");

function route(app) {
  // app.use("/product", productRouter);
  app.use("/api", apiRouter);
  app.use("/admin", adminRouter);
  app.use("/me", isLoggedIn, meRouter);
  app.use("/", siteRouter);
  app.use(function (req, res, next) {
    res.status(404).render("404");
  });
}
module.exports = route;
