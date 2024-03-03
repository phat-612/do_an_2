const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: "User" },
    ghichu: { type: String },
    tongtien: { type: Number },
    trangthai: { type: String },
    trangthaithanhtoan: { type: Bool },
    phuongthucthanhtoan: { type: String },
    chitiet: [
      {
        gia: { type: Number },
        soluong: { type: Number },
        idchitietsanpham: { type: Schema.Types.ObjectId, ref: "Product" },
      },
    ],
    thongtingiaohang: {
      hoten: { type: String },
      sodienthoai: { type: String },
      diachi: { type: String },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", Order);
