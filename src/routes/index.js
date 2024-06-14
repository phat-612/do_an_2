const siteRouter = require("./site");
const apiUserRouter = require("./apiUser");
const apiAdminRouter = require("./apiAdmin");
const apiPublicRouter = require("./apiPublic");
const adminRouter = require("./admin");
const meRouter = require("./me");

const {
  userLogin,
  isLoggedIn,
  adminLogin,
} = require("../app/middlewares/authMiddleware");

function route(app) {
  // app.use("/product", productRouter);
  // app.use("/api", apiRouter);
  app.use("/api/user", isLoggedIn, apiUserRouter);
  app.use("/api/admin", adminLogin, apiAdminRouter);
  app.use("/api", apiPublicRouter);
  app.use("/admin", adminLogin, adminRouter);
  app.use("/me", isLoggedIn, meRouter);
  app.use("/", siteRouter);
  app.use(function (req, res, next) {
    res.status(404).render("404");
  });
}
module.exports = route;
