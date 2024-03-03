const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Warranty = new Schema(
  {
    email: { type: String },
    hoten: { type: String },
    sodienthoai: { type: String },
    diachi: { type: String },
    hinhanh: [String],
    ghichu: { type: String },
    trangthai: { type: String },
    tongtien: { type: Number },
    chitiet: [
      {
        gia: { type: Number },
        lydo: { type: String },
      },
    ],
    idProduct: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Warranty", Warranty);
