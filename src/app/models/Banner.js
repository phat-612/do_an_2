const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Banner = new Schema({
  name: { type: String },
  image: { type: String },
  status: { type: Boolean, default: true },
});
module.exports = mongoose.model("Banner", Banner);
