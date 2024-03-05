const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = new Schema(
  {
    name: { type: String },
    description: { type: String },
    price: { type: Number, default: 0 },
    images: [String],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    details: [
      {
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        sold: { type: String, default: 0 },
        properties: [
          {
            name: { type: String },
            value: { type: String },
          },
        ],
      },
    ],
    discount: {
      percent: { type: Number, default: 0 },
      startDay: { type: Date },
      endDay: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", Product);
