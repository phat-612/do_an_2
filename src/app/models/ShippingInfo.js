const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ShippingInfo = new Schema({
  idUser: { type: Schema.Types.ObjectId, ref: "User" },
  hoten: { type: String },
  sodienthoai: { type: Number },
  diachi: { type: String },
  macdinh: { type: Boolean },
});
module.exports = mongoose.model("ShippingInfo", ShippingInfo);
