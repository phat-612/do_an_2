const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Color = new Schema({
  mausac: { type: String },
});
module.exports = mongoose.model("Color", Color);
