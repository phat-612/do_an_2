const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserLogin = new Schema({
  idUser: { type: Schema.Types.ObjectId, ref: "User" },
  email: { type: String },
  matkhau: { type: String },
});
module.exports = mongoose.model("UserLogin", UserLogin);
