const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Category = new Schema({
  name: String,
  properties: [
    {
      name: String,
      values: [String],
    },
  ],
});
module.exports = mongoose.model("Category", Category);
