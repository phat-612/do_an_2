const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema({
  hoten: { type: Char },
  email: { type: Char },
  sodienthoai: { type: Char },
  gioitinh: { type: Bool },
  diachi: { type: Char },
});
module.exports = mongoose.model("User", User);
