function userLogin(req, res, next) {
  if (req.session.idUser && req.session.role == "user") {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = { userLogin };
