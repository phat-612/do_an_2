const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = new Schema(
  {
    ten: { type: String },
    mota: { type: String },
    gia: { type: Number, default: 0 },
    hinhanh: [String],
    thuonghieu: { type: String },
    danhmuc: { type: String },
    chitiet: [
      {
        ram: { type: String },
        bonho: { type: String },
        mausac: { type: String },
        gia: { type: Number, default: 0 },
        soluong: { type: Number, default: 0 },
        daban: { type: String, default: 0 },
      },
    ],
    giamgia: {
      phantram: { type: Number, default: 0 },
      ngaybatdau: { type: Date },
      ngayketthuc: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", Product);
