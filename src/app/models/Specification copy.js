const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Specification = new Schema({
  ram: [{ type: String, default: [] }],
  storage: [{ type: String, default: [] }],
  color: [{ type: String, default: [] }],
  brand: [{ type: String, default: [] }],
  category: [{ type: String, default: [] }],
});
module.exports = mongoose.model("Specification", Specification);
