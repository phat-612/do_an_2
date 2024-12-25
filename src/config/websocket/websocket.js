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
          color: "#007bff",
          link: "/admin/listMessage",
          message: "Có tin nhắn mới",
        });
    });
    socket.on("joinRoom", (data) => {
      socket.join(data.room);
    });
    socket.on("leaveRoom", (data) => {
      socket.leave(data.room); // Xóa socket khỏi phòng
      // Phản hồi về client nếu cần
      socket.emit("roomLeft", { room: data.room });
    });
    // socket.on("disconnect");
  });
}

module.exports = initWedSocket;
