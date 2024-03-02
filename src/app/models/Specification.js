const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Specification = new Schema({
  ram: { type: String },
  bonho: { type: String },
  mausac: { type: String },
  thuonghieu: { type: String },
  danhmuc: { type: String },
});
module.exports = mongoose.model("Specification", Specification);
