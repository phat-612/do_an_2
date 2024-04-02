const Category = require("../models/Category");

function globalVariable(req, res, next) {
  if (req.session.name) {
    res.locals.name = req.session.name;
  }
  Category.find({ idParent: null }).then((categories) => {
    res.locals.categories = categories.map((category) => category.toObject());
    next();
  });
}

module.exports = globalVariable;
