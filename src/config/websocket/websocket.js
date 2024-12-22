const chatController = require("../../app/controllers/ChatController");
function initWedSocket(io) {
  const adminNamespace = io.of("/admin");
  const userNamespace = io.of("/user");
  io.on("connection", (socket) => {
    socket.on("sendMessage", chatController.userMessageHandler);
    socket.on("sendMessage", (data) => {
      if (!data.receiver)
        adminNamespace.emit("notify", {
          type: "success",
          color: '#007bff',
          message: "Có tin nhắn mới",
        });
    });
    socket.on("joinRoom", (data) => {
      socket.join(data.room);
    });
  });
}

module.exports = initWedSocket;
