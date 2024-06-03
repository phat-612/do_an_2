const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema(
  {
    email: { type: String },
    name: { type: String },
    phone: { type: String },
    role: { type: String, default: "user" },
    birthday: { type: Date, default: Date.now },
    gender: { type: Boolean, default: false },
    shipmentDetail: [
      {
        alias: { type: String },
        name: { type: String },
        phone: { type: String },
        address: { type: String },
        defaultAddress: { type: Boolean, default: false },
      },
    ],
    historyViews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);
User.statics.searchByEmail = function (email) {
  return this.find({ email: email });
};
// page navigation
User.statics.paginate = function (filter, options) {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  return this.find(filter).skip(skip).limit(limit);
};
module.exports = mongoose.model("User", User);
