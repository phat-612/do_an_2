const Category = require("../models/Category");

function globalVariable(req, res, next) {
  if (req.session.name) {
    res.locals.name = req.session.name;
  }
  Category.getCategoryChildren("660b8d5c99baa8b459c76890").then((categories) =>
    console.log(categories)
  );
  next();
}

module.exports = globalVariable;
