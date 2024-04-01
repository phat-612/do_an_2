const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Warranty = new Schema(
  {
    email: { type: String },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    images: [String],
    note: { type: String },
    status: { type: String },
    total: { type: Number },
    details: [
      {
        idProduct: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          // unique: true,
          index: true,
        },
        reasonAndPrice: [
          {
            reason: { type: String },
            price: { type: Number },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Warranty", Warranty);
