const Specification = require("../models/Specification");
const { storeSpecification } = require("../../util/function");
class ApiController {
  // storeRam(req, res, next) {
  //   const ram = req.params.ram;
  //   Specification.findOne({}),
  //     then((specification) => {
  //       if (specification) {
  //         specification.ram.push(ram);
  //         specification
  //           .save()
  //           .then(() =>
  //             res.status(200).json({ message: "Thêm ram thành công" })
  //           );
  //       } else {
  //         const specification = new Specification({
  //           ram: [ram],
  //         });
  //         specification
  //           .save()
  //           .then(() =>
  //             res.status(200).json({ message: "Thêm ram thành công" })
  //           );
  //       }
  //     });
  // }
  storeColor(req, res, next) {
    const color = req.body.color;
    storeSpecification(Specification, "mausac", color, res);
  }
}
module.exports = new ApiController();
