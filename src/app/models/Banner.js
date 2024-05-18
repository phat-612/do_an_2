const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Banner = new Schema(
  {
    name: { type: String },
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
    link: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Banner", Banner);
