let io; // Đảm bảo io được khởi tạo

module.exports = {
  init: (server) => {
    const socketIo = require("socket.io");
    io = socketIo(server); // Khởi tạo Socket.IO với server

    io.on("connection", (socket) => {
      const userSession = socket.handshake.session; // Kiểm tra session khi người dùng kết nối

      // Kiểm tra nếu người dùng có role là admin
      if (userSession && userSession.role === "admin") {
        console.log(
          `Admin ${userSession.name} connected with socket ID: ${socket.id}`
        );

        // Lắng nghe sự kiện `newOrder` từ phía client (admin)
        socket.on("newOrder", (orderData) => {
          console.log("New order received:", orderData);

          // Gửi thông báo đến tất cả admin
          io.sockets.sockets.forEach((client) => {
            const clientSession = client.handshake.session;

            // Chỉ gửi đến các admin
            if (clientSession && clientSession.role === "admin") {
              client.emit("notifyAdmin", orderData); // Gửi thông báo tới admin
            }
          });
        });
      } else {
        console.log(`User connected: ${socket.id} is not an admin.`);
      }

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
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
