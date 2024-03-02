const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema({
  hoten: { type: String },
  email: { type: String },
  sodienthoai: { type: String },
  gioitinh: { type: Bool },
  diachi: { type: String },
  diachigiaohang: [
    {
      hoten: { type: String },
      sodienthoai: { type: Number },
      diachi: { type: String },
      macdinh: { type: Boolean, default: false },
    },
  ],
});
module.exports = mongoose.model("User", User);
