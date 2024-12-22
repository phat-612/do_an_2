let io; // Đảm bảo io được khởi tạo

module.exports = {
  init: (server) => {
    const socketIo = require("socket.io");
    io = socketIo(server); // Khởi tạo Socket.IO với server

    io.on("connection", (socket) => {
      const userSession = socket.handshake.session; // Kiểm tra session khi người dùng kết nối

      // Kiểm tra nếu người dùng có role là admin
      if (userSession && userSession.role === "admin") {
        // Lắng nghe sự kiện `newOrder` từ phía client (admin)
        socket.on("newOrder", (data) => {
          io.sockets.sockets.forEach((client) => {
            const clientSession = client.handshake.session;
            if (clientSession && clientSession.role === "admin") {
              client.emit("notifyAdmin", data);
            }
          });
        });
      }
    });

    return io; // Trả về io để có thể sử dụng ở các file khác
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.IO chưa được khởi tạo!");
    }
    return io;
  },
};
