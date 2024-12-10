$(document).ready(function () {
  const socket = io(); // Kết nối đến server WebSocket
  if ($("#liveToast").attr("data-bs-Message") == "success") {
    const messageChung = "Đặt hàng thành công";
    socket.emit("newOrder", messageChung);
  }
});
