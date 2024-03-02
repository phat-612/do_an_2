const siteRouter = require("./site");
const apiRouter = require("./api");
const productRouter = require("./product");
const adminRouter = require("./admin");
function route(app) {
  app.use("/product", productRouter);
  app.use("/api", apiRouter);
  app.use("/admin", adminRouter);
  app.use("/", siteRouter);
}
module.exports = route;
