const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema(
  {
    email: { type: String },
    name: { type: String },
    phone: { type: String },
    role: { type: String, default: "user" },
    birthday: { type: Date, default: Date.now },
    gender: { type: Boolean, default: false },
    shipmentDetail: [
      {
        alias: { type: String },
        name: { type: String },
        phone: { type: String },
        address: { type: String },
        defaultAddress: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", User);
