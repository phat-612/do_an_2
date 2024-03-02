const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DetailPro = new Schema({
  idProduct: { type: Schema.Types.ObjectId, ref: "Product" },
  idColor: { type: Schema.Types.ObjectId, ref: "Color" },
  soluong: { type: Number },
});
module.exports = mongoose.model("DetailPro", DetailPro);
