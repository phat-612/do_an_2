const Category = require("../models/Category");

function globalVariable(req, res, next) {
  if (req.session.name) {
    res.locals.name = req.session.name;
  }
  Category.getCategoryChildren().then((categories) => {
    res.locals.categories = categories;
    next();
  });
}

module.exports = globalVariable;
