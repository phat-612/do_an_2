const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Liên kết tới schema User (người gửi)
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Liên kết tới schema User (người nhận)
  },
  message: [
    {
      room: {
        type: mongoose.Schema.Types.ObjectId,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Liên kết tới schema User (người gửi)
      },
      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Liên kết tới schema User (người nhận)
      },
      content: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
