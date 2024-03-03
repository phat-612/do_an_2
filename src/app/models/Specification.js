const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Specification = new Schema({
  ram: [{ type: String, default: [] }],
  bonho: [{ type: String, default: [] }],
  mausac: [{ type: String, default: [] }],
  thuonghieu: [{ type: String, default: [] }],
  danhmuc: [{ type: String, default: [] }],
});
module.exports = mongoose.model("Specification", Specification);
