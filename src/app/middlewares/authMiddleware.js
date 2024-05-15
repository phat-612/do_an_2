function userLogin(req, res, next) {
  if (req.session.idUser && req.session.role == "user") {
    return next();
  } else {
    res.redirect("/login");
  }
}
function adminLogin(req, res, next) {
  if (req.session.idUser && req.session.role == "admin") {
    return next();
  } else {
    res.redirect("/login");
  }
}
function isLoggedIn(req, res, next) {
  const arrUrl = ["/login", "/signup"];
  if (!req.session.idUser && !arrUrl.includes(req.originalUrl.toLowerCase())) {
    return res.redirect("/login");
  }
  if (req.session.idUser && arrUrl.includes(req.originalUrl.toLowerCase())) {
    return res.redirect("/me");
  }
  next();
}

module.exports = { userLogin, adminLogin, isLoggedIn };
