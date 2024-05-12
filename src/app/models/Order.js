const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    total: { type: Number },
    status: {
      type: String,
      enum: ["pending", "success", "cancel", "failed", "shipping"],
      default: "pending",
    },
    paymentDetail: {
      method: { type: String, enum: ["cod", "online"], required: true },
      status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
      },
      date: { type: Date },
      amount: { type: Number },
    },
    details: [
      {
        price: { type: Number },
        quantity: { type: Number },
        idVariation: {
          type: Schema.Types.ObjectId,
          ref: "Product.variations",
        },
        discout: { type: Number },
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
