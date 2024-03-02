class ApiController {
  storeColor(req, res, next) {
    res.send("storeColor");
  }
}
module.exports = new ApiController();
