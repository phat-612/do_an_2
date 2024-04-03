const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    total: { type: Number },
    status: { type: String },
    paymentStatus: { type: Boolean },
    paymentMethod: { type: String },
    details: [
      {
        price: { type: Number },
        quantity: { type: Number },
        idVariation: {
          type: Schema.Types.ObjectId,
          ref: "Product.variations",
        },
      },
    ],
    shipmentDetail: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", Order);
