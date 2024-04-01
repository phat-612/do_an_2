const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Cart = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        idVariation: { type: Schema.Types.ObjectId, ref: "Product.variations" },
        quantity: { type: Number },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cart", Cart);
