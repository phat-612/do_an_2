function userLogin(req, res, next) {
  console.log("middleware user", req.session);
  if (req.session.idUser && req.session.role == "user") {
    console.log("đã login");
    return next();
  } else {
    console.log("chưa login");
    res.redirect("/login");
  }
}

module.exports = { userLogin };
