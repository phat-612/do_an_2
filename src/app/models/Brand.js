const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Brand = new Schema({
  thuonghieu: { type: String },
});
module.exports = mongoose.model("Brand", Brand);
