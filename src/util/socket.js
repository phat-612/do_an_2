module.exports = (io) => {
  io.on("connection", (socket) => {
    // Nhận sự kiện `newOrder` từ phía client
    socket.on("newOrder", (orderData) => {
      // Gửi thông báo đến tất cả admin
      io.emit("notifyAdmin", orderData);
    });
  });
};
