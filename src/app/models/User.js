const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema({
  email: { type: String },
  name: { type: String },
  phone: { type: String },
  role: { type: String, default: "user" },
  gender: { type: Boolean, default: false },
  address: { type: String },
  shipmentDetail: [
    {
      name: { type: String },
      phone: { type: Number },
      address: { type: String },
      default: { type: Boolean, default: false },
    },
  ],
});
module.exports = mongoose.model("User", User);
