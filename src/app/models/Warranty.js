const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Warranty = new Schema(
  {
    email: { type: String },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "fixing", "success", "paid"],
      default: "pending",
    },
    total: { type: Number },
    details: [
      {
        idProduct: {
          type: Schema.Types.ObjectId,
          ref: "Product",
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
// filterable
Warranty.query.filterable = function (req) {
  if (req.query.hasOwnProperty("_filter")) {
    return this.find({
      [req.query.column]: req.query.value,
    });
  }
  return this;
};
// page navigation
Warranty.query.paginate = function (req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 16;
  const skip = (page - 1) * limit;
  return this.skip(skip).limit(limit);
};
Warranty.pre("save", function (next) {
  let total = 0;

  for (let detail of this.details) {
    for (let reasonAndPrice of detail.reasonAndPrice) {
      total += reasonAndPrice.price;
    }
  }

  this.total = total;
  next();
});
module.exports = mongoose.model("Warranty", Warranty);
