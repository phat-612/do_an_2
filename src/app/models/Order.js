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
        enum: ["pending", "success", "failed", "cancel"],
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
        discount: { type: Number },
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

// filterable
Order.query.filterable = function (req) {
  if (req.query.hasOwnProperty("_filter")) {
    return this.find({
      [req.query.column]: req.query.value,
    });
  }
  return this;
};
// page navigation
Order.query.paginate = function (req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 16;
  const skip = (page - 1) * limit;
  return this.skip(skip).limit(limit);
};
module.exports = mongoose.model("Order", Order);
