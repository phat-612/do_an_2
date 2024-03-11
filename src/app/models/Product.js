const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = new Schema(
  {
    name: { type: String },
    description: { type: String },
    images: [String],
    idCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    variations: [
      {
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        attributes: { type: Object },
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
