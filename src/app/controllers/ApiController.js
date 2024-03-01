class ApiController {
  index(req, res) {
    res.send("api");
  }
}
module.exports = new ApiController();
