const chatController = require("../../app/controllers/ChatController");
function message(io) {
  io.on("connection", (socket) => {
    socket.on("sendMessage", chatController.userMessageHandler);
    socket.on("joinRoom", (data) => {
      socket.join(data.room);
    });
  });
}

module.exports = message;
