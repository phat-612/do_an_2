document.addEventListener("DOMContentLoaded", () => {
  const chatItems = document.querySelectorAll(".chat-item");
  const chatboxContainer = document.getElementById("chatboxContainer");
  const chatboxUserName = document.getElementById("chatboxUserName");
  const chatboxMessages = document.getElementById("chatboxMessages");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.querySelector(".btn-primary");
  let currentChatUser = null;

  chatItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      chatItems.forEach((ele) => ele.classList.remove("active-chat"));
      const eleChat = $(e.target).closest(".chat-item");
      eleChat.addClass("active-chat");
      const userName = item.getAttribute("data-username");
      const id = item.getAttribute("data-id");
      currentChatUser = id;
      chatboxContainer.style.display = "block";
      chatboxUserName.textContent = userName;

      // Lấy danh sách tin nhắn từ server
      const allMessages = await getMessagesForUser(id);

      // Hiển thị tin nhắn trong chatbox với thời gian nằm bên dưới
      chatboxMessages.innerHTML = allMessages
        .map(
          (message) => ` 
   <div class="message" style="display: flex; flex-direction: column; align-items: ${
     message.receiver ? "flex-end" : "flex-start"
   }; margin-top: 5px;">
     <div class="message-text d-inline-block p-2 rounded text-dark" style="padding: 8px 12px; display: flex; flex-direction: column; background-color: ${
       message.receiver ? "rgb(219, 235, 255)" : "#fff"
     }">
       ${message.content}
       <div class="message-time mt-2 text-muted small" style="color: #ccc">
         ${new Date(message.timestamp).toLocaleTimeString([], {
           hour: "2-digit",
           minute: "2-digit",
         })}
       </div>
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
  sendButton.addEventListener("click", sendMessage);
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
        timestamp: new Date().toISOString(), // Thêm thời gian gửi tin nhắn
      };
      socket.emit("sendMessage", messageData); // Gửi tin nhắn qua WebSocket

      // Hiển thị tin nhắn đã gửi trong chatbox với thời gian dưới tin nhắn
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "text-end");
      const messageContainer = document.createElement("div");
      messageContainer.classList.add("message-container");
      messageContainer.style.textAlign = "right";
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
      const timeElement = document.createElement("div");
      timeElement.classList.add("message-time", "text-muted", "small");
      timeElement.style.marginTop = "5px";
      timeElement.textContent = new Date().toLocaleTimeString(); // Hiển thị thời gian
      messageContainer.appendChild(messageText);
      messageContainer.appendChild(timeElement); // Thêm thời gian dưới tin nhắn
      messageElement.appendChild(messageContainer);
      chatboxMessages.appendChild(messageElement);
      chatInput.value = ""; // Xóa input sau khi gửi
      chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Cuộn đến tin nhắn mới nhất
    }
  }

  // Lắng nghe sự kiện newMessage từ server
  socket.on("newMessage", (data) => {
    const receivedMessage = document.createElement("div");
    receivedMessage.classList.add("message", "text-start");
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");
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
    const timeElement = document.createElement("div");
    timeElement.classList.add("message-time", "text-muted", "small");
    timeElement.style.marginTop = "5px";
    timeElement.textContent = new Date(data.timestamp).toLocaleTimeString(); // Hiển thị thời gian của tin nhắn mới
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(timeElement); // Thêm thời gian dưới tin nhắn
    receivedMessage.appendChild(messageContainer);
    chatboxMessages.appendChild(receivedMessage);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
  });

  socket.on("thongbao", async (data) => {
    // Lấy thông tin người gửi tin nhắn
    const users = await getMessagesForUser(data.sender);
    const userName = users.length > 0 ? users[0].userName.name : data.sender;
    const lastMessage =
      users.length > 0
        ? users[users.length - 1].content
        : "Không có tin nhắn nào";

    const existingChatItem = document.querySelector(
      `[data-id="${data.sender}"]`
    );

    const notification = document.createElement("div");
    notification.classList.add(
      "alert",
      "alert-info",
      "d-flex",
      "align-items-center",
      "mt-2"
    );
    notification.innerHTML = `Bạn có tin nhắn mới từ ${userName}`;

    const chatList = document.querySelector(".chat-list");
    chatList.prepend(notification);

    notification.addEventListener("click", async (event) => {
      event.preventDefault();
      notification.remove();

      if (!existingChatItem) {
        const chatItem = document.createElement("div");
        chatItem.classList.add(
          "chat-item",
          "d-flex",
          "align-items-center",
          "p-2",
          "border-bottom"
        );
        chatItem.setAttribute("data-username", userName);
        chatItem.setAttribute("data-id", data.sender);

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

        chatList.prepend(chatItem);
        chatItem.addEventListener("click", async () => {
          currentChatUser = data.sender;
          chatboxContainer.style.display = "block";
          chatboxUserName.textContent = userName;

          const allMessages = await getMessagesForUser(data.sender);

          chatboxMessages.innerHTML = allMessages
            .map(
              (message) => ` 
          <div class="message pb-1" style="display: flex; justify-content: ${
            message.receiver ? "flex-end" : "flex-start"
          };">
            <div class="message-container" style="display: inline-block; text-align: left;">
              <div class="message-text d-inline-block p-2 rounded ${
                message.receiver
                  ? "bg-primary text-white"
                  : "bg-light text-dark"
              }" style="padding: 8px 12px;">
                ${message.content}
              </div>
              <div class="message-time text-muted small" style="margin-top: 5px;">
                ${new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        `
            )
            .join("");
          chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
        });
      } else {
        currentChatUser = data.sender;
        chatboxContainer.style.display = "block";
        chatboxUserName.textContent = userName;

        const allMessages = await getMessagesForUser(data.sender);

        chatboxMessages.innerHTML = allMessages
          .map(
            (message) => ` 
        <div class="message pb-1" style="display: flex; justify-content: ${
          message.receiver ? "flex-end" : "flex-start"
        };">
            <div class="message-container" style="display: inline-block; text-align: left;">
              <div class="message-text d-inline-block p-2 rounded ${
                message.receiver
                  ? "bg-primary text-white"
                  : "bg-light text-dark"
              }" style="padding: 8px 12px;">
                ${message.content}
              </div>
              <div class="message-time text-muted small" style="margin-top: 5px;">
                ${new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        `
          )
          .join("");
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
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
