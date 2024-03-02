const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(
      "mongodb+srv://nguyenphatssj0612:Be51yyb3YPQ10ZkT@cluster0.efuajlb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connect successfully");
  } catch (error) {
    console.log("Connect failed");
  }
}

module.exports = { connect };
