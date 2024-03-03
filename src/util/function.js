module.exports = {
  storeSpecification: function (Specification, name, value, res) {
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
  },
};
