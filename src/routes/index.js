const siteRouter = require("./site");
const apiRouter = require("./api");
const productRouter = require("./product");
const adminRouter = require("./admin");
const meRouter = require("./me");
function route(app) {
  app.use("/product", productRouter);
  app.use("/api", apiRouter);
  app.use("/admin", adminRouter);
  app.use("/me", meRouter);
  app.use("/", siteRouter);
}
module.exports = route;
