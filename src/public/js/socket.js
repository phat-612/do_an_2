window.onload = () => {
  const userSessionRole = session.role;
  console.log(userSessionRole);
  if (userSessionRole === "admin") {
    const socket = io();
    socket.on("newOrder", (data) => {
      const toastElement = $("#notifyAdmin");
      toastElement.toast("show"); // Hiển thị toast thông báo
      $(".textMessage").text("Có Đơn Hàng Mới !!!");
    });
  }
};
