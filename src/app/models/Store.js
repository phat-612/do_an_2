const mongoose = require("mongoose");
const diacritics = require("diacritics");

const Schema = mongoose.Schema;
const Store = new Schema({});

module.exports = mongoose.model("Category", Category);
