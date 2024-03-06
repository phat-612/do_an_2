const Category = require("../models/Category");
const {} = require("../../util/function");
class ApiController {
  // api user,admin
  // api user
  // aip admin
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
  storeWarranty(req, res, next) {
    res.json(req.body);
  }
}
module.exports = new ApiController();
