const Category = require("../models/Category");
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
  // storeSpecification(req, res, next) {
  //   // name: tên, value: giá trị ---- của thuộc tính trong db
  //   const name = req.body.name;
  //   const value = req.body.value;
  //   Specification.findOne({}).then((specification) => {
  //     if (specification) {
  //       specification[name].push(value);
  //       specification.save().then(() => {
  //         res.status(200).json({ message: "Thêm thành công" });
  //       });
  //     } else {
  //       const specification = new Specification({
  //         [name]: value,
  //       });
  //       specification.save().then(() => {
  //         res.status(200).json({ message: "Thêm thành công" });
  //       });
  //     }
  //   });
  // }
  storeCategory(req, res, next) {
    const nameInp = req.body.name;
    const propertiesInp = req.body.properties;
    Category.findOne({ name: nameInp }).then((category) => {
      if (category) {
        // đã tồn tại danh mục
        // kiểm tra property đã tồn tại chưa
        propertiesInp.forEach((propertyInp) => {
          const property = category.properties.find(
            (p) => p.name === propertyInp.name
          );
          if (property) {
            // đã tồn tại property -> thêm giá trị mới
            property.values.push(propertyInp.values[0]);
          } else {
            // chưa tồn tại property -> tạo mới
            category.properties.push({
              name: propertyInp.name,
              values: propertyInp.values,
            });
          }
        });
        category.save().then(() => {
          res.status(200).json({ message: "Thêm danh mục thành công (push)" });
        });
      } else {
        // chưa tồn tại danh mục -> tạo mới
        const category = new Category({
          name: nameInp,
          properties: propertiesInp,
        });
        category.save().then(() => {
          res
            .status(200)
            .json({ message: "Thêm danh mục thành công (create)" });
        });
      }
    });
  }
}
module.exports = new ApiController();
