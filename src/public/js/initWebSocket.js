const socket = io(); // Kết nối đến server
const adminNamespace = io("/admin"); // Kết nối đến namespace admin
const userNamespace = io("/user"); // Kết nối đến namespace user
const toastQueue = [];

const notificationQueue = []; // Hàng đợi chứa thông báo
const maxNotifications = 10; // Số lượng thông báo tối đa hiển thị

// Hàm thêm thông báo vào hàng đợi
function addNotification(message, type, color) {
  notificationQueue.push({ message, type, color });
  processNotifications();
}

// Hàm xử lý hiển thị thông báo
function processNotifications() {
  const container = document.getElementById("notification-container");
  const activeNotifications = container.querySelectorAll(".notification").length;

  if (activeNotifications >= maxNotifications) return;

  while (notificationQueue.length > 0 && activeNotifications + container.childElementCount < maxNotifications) {
    const { message, type, color } = notificationQueue.shift();
    const bgColor = color || (type === "error" ? "red" : "green");
    console.log(message, type, bgColor);
    const notification = document.createElement("div");
    notification.className = `notification toastct`;
    notification.style.backgroundColor = bgColor;
    const header = document.createElement("div");
    header.className = "toastct-header";
    header.textContent = "Thông báo!";

    const content = document.createElement("div");
    content.className = "toastct-body";
    content.textContent = message;

    notification.appendChild(header);
    notification.appendChild(content);

    // Thêm thông báo vào container
    container.appendChild(notification);

    // Xóa thông báo sau 2 giây
    setTimeout(() => {
      notification.classList.add("hidden");
      setTimeout(() => {
        container.removeChild(notification);
        processNotifications(); // Gọi lại để xử lý thông báo tiếp theo
      }, 500); // Thời gian trễ để hoàn tất hiệu ứng ẩn
    }, 3500);
  }
}

const role = sessions.role;
if (role === "admin") {
  adminNamespace.on('notify', (data) => {
    // Hiển thị thông báo hoặc xử lý sự kiện
    addNotification(data.message, data.type, data.color);
  });
}