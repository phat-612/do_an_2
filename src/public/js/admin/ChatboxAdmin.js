document.addEventListener("DOMContentLoaded", () => {
  const chatItems = document.querySelectorAll(".chat-item");
  const chatboxContainer = document.getElementById("chatboxContainer");
  const chatboxUserName = document.getElementById("chatboxUserName");
  const chatboxMessages = document.getElementById("chatboxMessages");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.querySelector(".btn-primary");
  let currentChatUser = null;

  // Kết nối với WebSocket
  //   var socket = io.connect("http://localhost:3000");

  // Lắng nghe sự kiện click vào các chat item
  chatItems.forEach((item) => {
    item.addEventListener("click", async () => {
      const userName = item.getAttribute("data-username");
      const id = item.getAttribute("data-id"); // Đây là ID người dùng, không phải tên
      currentChatUser = id; // Đặt ID người dùng là ID phòng chat
      chatboxContainer.style.display = "block";
      chatboxUserName.textContent = userName;

      // Lấy danh sách tin nhắn từ server
      const allMessages = await getMessagesForUser(id);

      // Hiển thị tin nhắn trong chatbox
      chatboxMessages.innerHTML = allMessages
        .map(
          (message) => ` 
          <div class="message pb-1" style="display: flex; justify-content: ${
            message.receiver ? "flex-end" : "flex-start"
          };">
            <div class="message-text d-inline-block p-2 rounded ${
              message.receiver ? "bg-primary text-white" : "bg-light text-dark"
            }" style="padding: 8px 12px;">
              ${message.content}
            </div>
          </div>
        `
        )
        .join("");

      chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
      socket.emit("joinRoom", { room: id });
      console.log(`Người dùng đã tham gia phòng: ${id}`);
    });
  });

  // Khi gửi tin nhắn
  sendButton.addEventListener("click", sendMessage); // Thêm sự kiện cho nút gửi
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage(event) {
    if (event) event.preventDefault(); // Ngừng hành động mặc định của form
    const message = chatInput.value.trim();
    if (message.length > 0 && currentChatUser) {
      const messageData = {
        message: message,
        room: currentChatUser,
        sender: idAdmin,
        receiver: currentChatUser,
      };
      socket.emit("sendMessage", messageData); // Gửi tin nhắn qua WebSocket

      // Hiển thị tin nhắn đã gửi trong chatbox
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "text-end");
      messageElement.style.marginBottom = "5px";
      const messageText = document.createElement("div");
      messageText.classList.add(
        "message-text",
        "d-inline-block",
        "p-2",
        "rounded",
        "bg-primary",
        "text-white"
      );
      messageText.textContent = message;
      messageElement.appendChild(messageText);
      chatboxMessages.appendChild(messageElement);
      chatInput.value = ""; // Xóa input sau khi gửi
      chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Cuộn đến tin nhắn mới nhất
    }
  }

  // Lắng nghe sự kiện newMessage từ server
  socket.on("newMessage", (data) => {
    const receivedMessage = document.createElement("div");
    receivedMessage.classList.add("message", "text-start");
    receivedMessage.style.marginBottom = "5px";
    const messageText = document.createElement("div");
    messageText.classList.add(
      "message-text",
      "d-inline-block",
      "p-2",
      "rounded",
      "bg-light",
      "text-dark"
    );
    messageText.textContent = data.message;
    receivedMessage.appendChild(messageText);
    chatboxMessages.appendChild(receivedMessage);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
  });

  socket.on("thongbao", async (data) => {
    // Lấy thông tin người gửi tin nhắn
    const users = await getMessagesForUser(data.sender); // Lấy danh sách người dùng từ ID người gửi
    const userName = users.length > 0 ? users[0].userName.name : data.sender;
    const lastMessage =
      users.length > 0
        ? users[users.length - 1].content
        : "Không có tin nhắn nào";

    // Kiểm tra nếu người dùng đã có trong danh sách chat
    const existingChatItem = document.querySelector(
      `[data-id="${data.sender}"]`
    );

    // Tạo thông báo tin nhắn mới
    const notification = document.createElement("div");
    notification.classList.add(
      "alert",
      "alert-info",
      "d-flex",
      "align-items-center",
      "mt-2"
    );
    notification.innerHTML = `Bạn có tin nhắn mới từ ${userName}`;

    // Thêm thông báo vào danh sách chat
    const chatList = document.querySelector(".chat-list");
    chatList.prepend(notification);

    // Thêm sự kiện click vào thông báo
    notification.addEventListener("click", async (event) => {
      event.preventDefault();

      // Xóa thông báo sau khi click vào
      notification.remove();

      // Tạo phần tử chat mới cho người dùng này nếu chưa có
      if (!existingChatItem) {
        const chatItem = document.createElement("div");
        chatItem.classList.add(
          "chat-item",
          "d-flex",
          "align-items-center",
          "p-2",
          "border-bottom"
        );
        chatItem.style.cursor = "pointer";
        chatItem.setAttribute("data-username", userName);
        chatItem.setAttribute("data-id", data.sender); // Sử dụng ID người gửi làm ID

        // Tạo avatar và thông tin người gửi
        chatItem.innerHTML = `
        <div class="avatar me-3">
          <img src="https://via.placeholder.com/50" alt="Avatar" class="rounded-circle"/>
        </div>
        <div class="chat-details flex-grow-1">
          <div class="d-flex justify-content-between">
            <span class="fw-bold">${userName}</span>
            <small class="text-muted">${new Date().toLocaleTimeString()}</small>
          </div>
          <div class="text-truncate text-muted">${lastMessage}</div>
        </div>
      `;

        // Thêm phần tử chat vào danh sách
        chatList.prepend(chatItem);

        // Gọi lại sự kiện click trên chatItem để hiển thị tin nhắn
        chatItem.addEventListener("click", async () => {
          const userName = chatItem.getAttribute("data-username");
          const id = chatItem.getAttribute("data-id");
          currentChatUser = id; // Đặt ID người dùng là ID phòng chat
          chatboxContainer.style.display = "block"; // Hiển thị khung chat
          chatboxUserName.textContent = userName;

          // Lấy danh sách tin nhắn từ server
          const allMessages = await getMessagesForUser(id);

          // Hiển thị tin nhắn trong chatbox
          chatboxMessages.innerHTML = allMessages
            .map(
              (message) => ` 
          <div class="message pb-1" style="display: flex; justify-content: ${
            message.receiver ? "flex-end" : "flex-start"
          };">
            <div class="message-text d-inline-block p-2 rounded ${
              message.receiver ? "bg-primary text-white" : "bg-light text-dark"
            }" style="padding: 8px 12px;">
              ${message.content}
            </div>
          </div>
        `
            )
            .join("");

          chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
          socket.emit("joinRoom", { room: id });
          console.log(`Người dùng đã tham gia phòng: ${id}`);
        });
      } else {
        // Nếu đã có mục chat trong danh sách, chỉ cần mở chatbox và hiển thị tin nhắn
        currentChatUser = data.sender;
        chatboxContainer.style.display = "block"; // Hiển thị khung chat
        chatboxUserName.textContent = userName;

        const allMessages = await getMessagesForUser(data.sender);

        chatboxMessages.innerHTML = allMessages
          .map(
            (message) => ` 
        <div class="message pb-1" style="display: flex; justify-content: ${
          message.receiver ? "flex-end" : "flex-start"
        };">
          <div class="message-text d-inline-block p-2 rounded ${
            message.receiver ? "bg-primary text-white" : "bg-light text-dark"
          }" style="padding: 8px 12px;">
            ${message.content}
          </div>
        </div>
      `
          )
          .join("");

        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
        socket.emit("joinRoom", { room: data.sender });
      }
    });
  });
});

// Hàm lấy tin nhắn cho người dùng từ server
async function getMessagesForUser(id) {
  const response = await fetch(`/api/admin/messages/${id}`);
  if (!response.ok) {
    throw new Error("Không thể tải tin nhắn");
  }
  const messages = await response.json();
  return messages;
}
