const Category = require("../models/Category");

function globalVariable(req, res, next) {
  if (req.session.name) {
    res.locals.name = req.session.name;
  }
  // Category.getCategoryChildren().then((categories) => console.log(categories));
  next();
}

module.exports = globalVariable;
