const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: "User" },
    idShippingInfo: { type: Schema.Types.ObjectId, ref: "ShippingInfo" },
    ghichu: { type: String },
    tongtien: { type: Number },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", Order);
