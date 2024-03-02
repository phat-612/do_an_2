const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = new Schema(
  {
    ten: { type: String, maxLength: 255 },
    mota: { type: String, maxLength: 600 },
    gia: { type: Number, maxLength: 255 },
    daban: { type: String, maxLength: 255 },
    hinhanh: [String],
    idCategory: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", Product);
