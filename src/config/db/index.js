const mongoose = require("mongoose");
require("dotenv").config();

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect successfully");
  } catch (error) {
    console.log("Connect failed");
  }
}

module.exports = { connect };
