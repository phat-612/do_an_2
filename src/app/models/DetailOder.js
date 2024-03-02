const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DetailOrder = new Schema(
  {
    gia: { type: Number },
    soluong: { type: Number },
    idDetailPro: { type: Schema.Types.ObjectId, ref: "DetailPro" },
    idOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    idShippingInfo: { type: Schema.Types.ObjectId, ref: "ShippingInfo" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("DetailOrder", DetailOrder);
