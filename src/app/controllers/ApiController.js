const Specification = require("../models/Specification");

class ApiController {
  storeColor(req, res, next) {
    const color = req.body.color;
    Specification.findOne({}).then((specification) => {
      if (specification) {
        specification.mausac.push(color);
        specification
          .save()
          .then(() =>
            res.status(200).json({ message: "Thêm màu sắc thành công" })
          );
      } else {
        const specification = new Specification({
          mausac: [color],
        });
        specification
          .save()
          .then(() =>
            res.status(200).json({ message: "Thêm màu sắc thành công" })
          );
      }
    });
  }
}
module.exports = new ApiController();
