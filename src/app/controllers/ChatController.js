const Message = require("../models/Messages");
class ChatController {
  async userMessageHandler(data) {
    const { message, sender, receiver, room } = data;
    const isProduct = !!data.isProduct;
    this.to(room).emit("newMessage", {
      message: message,
      sender: sender,
      isProduct: isProduct,
      receiver: receiver || null,
      timestamp: new Date(),
    });
    if (!receiver) {
      this.broadcast.emit("thongbao", {
        sender: sender,
        receiver: receiver || null,
        timestamp: new Date(),
      });
    }
    // Kiểm tra nếu tin nhắn đã có trong cơ sở dữ liệu dựa trên room (mã sender)
    let existingMessage = await Message.findOne({ "message.room": room });
    if (existingMessage) {
      // Nếu đã có tin nhắn, thêm tin nhắn mới vào mảng message
      existingMessage.message.push({
        room: room,
        sender: sender,
        isProduct,
        receiver: receiver || null, // Đặt receiver nếu có
        content: message,
        timestamp: new Date(),
      });
      await existingMessage.save();
    } else {
      // Nếu chưa có tin nhắn cho room, tạo mới
      const newMessage = new Message({
        sender: sender,
        receiver: receiver || null, // Đặt receiver nếu có
        message: [
          {
            room: room,
            sender: sender,
            receiver: receiver || null,
            isProduct,
            content: message,
            timestamp: new Date(),
          },
        ],
        timestamp: new Date(),
      });

      await newMessage.save();
    }
  }
}
module.exports = new ChatController();
