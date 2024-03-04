const Specification = require("../models/Specification");
const {} = require("../../util/function");
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
  storeSpecification(req, res, next) {
    // name: tên, value: giá trị ---- của thuộc tính trong db
    const name = req.body.name;
    const value = req.body.value;
    Specification.findOne({}).then((specification) => {
      if (specification) {
        specification[name].push(value);
        specification.save().then(() => {
          res.status(200).json({ message: "Thêm thành công" });
        });
      } else {
        const specification = new Specification({
          [name]: value,
        });
        specification.save().then(() => {
          res.status(200).json({ message: "Thêm thành công" });
        });
      }
    });
  }
}
module.exports = new ApiController();
