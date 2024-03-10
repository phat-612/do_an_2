const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Category = new Schema({
  name: String,
  idParent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
});
module.exports = mongoose.model("Category", Category);
