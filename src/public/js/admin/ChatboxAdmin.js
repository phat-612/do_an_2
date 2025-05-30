document.addEventListener("DOMContentLoaded", () => {
  let chatItems = document.querySelectorAll(".chat-item");
  const chatboxContainer = document.getElementById("chatboxContainer");
  const chatboxUserName = document.getElementById("chatboxUserName");
  const chatboxMessages = document.getElementById("chatboxMessages");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.querySelector(".btn-primary");
  let currentChatUser = null;

  let currentRoom = null; // Biến lưu trữ phòng hiện tại

  // Khi click vào một cuộc trò chuyện
  function setOnclickChat(){
    chatItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        chatItems = document.querySelectorAll(".chat-item");
        // Xóa trạng thái "active-chat" khỏi tất cả các mục
        chatItems.forEach((ele) => ele.classList.remove("active-chat"));
        // Lấy phần tử đang được click
        const eleChat = $(e.target).closest(".chat-item");
        eleChat.addClass("active-chat");
        // Lấy thông tin người dùng và ID phòng
        const userName = item.getAttribute("data-username");
        const id = item.getAttribute("data-id");
        currentChatUser = id;
        // Hiển thị giao diện chatbox
        chatboxContainer.style.display = "block";
        chatboxUserName.textContent = userName;
        const allMessages = await getMessagesForUser(id);
        let arrChat = allMessages.map((message, ind) => {
          if (!message.isProduct) {
            return `
              <div class="message" style="display: flex; flex-direction: column; align-items: ${message.receiver ? "flex-end" : "flex-start"
              }; margin-top: 5px;">
                <div class="message-text d-inline-block p-2 rounded text-dark" style="padding: 8px 12px; display: flex; flex-direction: column; background-color: ${message.receiver ? "rgb(219, 235, 255)" : "#f0f0f0"
              }; word-break: break-word; overflow-wrap: break-word; max-width: 300px; white-space: normal;">
                  ${message.content}
                  <div class="message-time text-muted last-message small" style="color: #ccc; margin-top: 5px;">
                    ${new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
                  </div>
                </div>
              </div>
            `;
          } else {
            // Placeholder for product message
            return `
              <div class="message product-message" data-stt="${ind}" style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 5px;">
                <div class="message-text d-inline-block p-2 rounded text-dark" style="padding: 8px 12px; display: flex; flex-direction: column; background-color: #f0f0f0; word-break: break-word; overflow-wrap: break-word; max-width: 300px; white-space: normal;">
                  Đang tải thông tin sản phẩm...
                </div>
              </div>
            `;
          }
        });
        arrChat = await Promise.all(arrChat);
        chatboxMessages.innerHTML = arrChat.join("");
  
        // Cuộn xuống cuối cùng của khung chat
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
        // Lazy load product messages
        let countMessage = allMessages.length;
        allMessages.reverse().forEach(async (message, ind) => {
          if (message.isProduct) {
            const idVariation = message.content;
            const response = await createProductMessage(idVariation);
            const productMessageElement = chatboxMessages.querySelector(
              `.product-message[data-stt="${countMessage - ind - 1}"]`
            );
            if (productMessageElement) {
              productMessageElement.innerHTML = response;
              chatboxMessages.scrollTop += 90;
            }
          }
        });
        // Rời phòng hiện tại nếu đã tham gia
        if (currentRoom) {
          socket.emit("leaveRoom", { room: currentRoom });
        }
  
        // Tham gia phòng mới
        socket.emit("joinRoom", { room: id });
  
        // Cập nhật phòng hiện tại
        currentRoom = id;
      });
    });
  }
setOnclickChat();
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

      // Hiển thị tin nhắn trong chatbox
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "text-end");

      const messageContainer = document.createElement("div");
      messageContainer.classList.add("message-container", "mt-1");
      messageContainer.style.textAlign = "right";

      const messageTextContainer = document.createElement("div");
      messageTextContainer.classList.add(
        "message-text-container",
        "d-inline-block",
        "p-2",
        "rounded",
        "text-black"
      );
      messageTextContainer.style.backgroundColor = "rgb(219, 235, 255)";
      messageTextContainer.style.overflowWrap = "break-word";
      messageTextContainer.style.whiteSpace = "pre-wrap";
      messageTextContainer.style.maxWidth = "300px";
      messageTextContainer.style.textAlign = "left";
      messageTextContainer.style.direction = "ltr";

      // Nội dung tin nhắn
      const messageText = document.createElement("span");
      messageText.classList.add("message-start");
      messageText.textContent = message;

      // Thời gian
      const timeElement = document.createElement("div");
      timeElement.classList.add(
        "message-time",
        "text-muted",
        "text-start",
        "small"
      );
      timeElement.style.marginTop = "5px"; // Khoảng cách giữa tin nhắn và thời gian
      timeElement.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Thêm tin nhắn vào messageTextContainer
      messageTextContainer.appendChild(messageText);
      // Thêm thời gian vào messageTextContainer
      messageTextContainer.appendChild(timeElement);

      // Thêm phần tử chứa vào messageContainer
      messageContainer.appendChild(messageTextContainer);
      messageElement.appendChild(messageContainer);

      // Thêm tin nhắn vào giao diện chat
      chatboxMessages.appendChild(messageElement);

      // Cập nhật tin nhắn cuối cùng trong danh sách cuộc trò chuyện
      const lastMessageElement = document.querySelector(
        `[data-id="${currentChatUser}"] .last-message`
      );
      if (lastMessageElement) {
        lastMessageElement.textContent = `Bạn: ${message}`;
        lastMessageElement.style.fontWeight = "";
        lastMessageElement.style.color = "";
      }

      // Cập nhật thời gian tin nhắn cuối cùng trong danh sách cuộc trò chuyện
      const lastMessageTimeElement = document.querySelector(
        `[data-id="${currentChatUser}"] .chat-details small`
      );
      if (lastMessageTimeElement) {
        lastMessageTimeElement.textContent = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }); // Cập nhật thời gian của tin nhắn cuối cùng
      }
      chatInput.value = "";
      chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
      chatInput.value = "";
      chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }
  }
  socket.on("thongbao", async (data) => {
    const messages = await getMessagesForUser(data.sender);
    const userName =
      messages.length > 0 ? messages[0].userName.name : data.sender;
    const lastMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "Không có tin nhắn nào";

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const existingChatItem = document.querySelector(
      `[data-id="${data.sender}"]`
    );

    if (!existingChatItem) {
      // Tạo mới phần tử chat nếu chưa có
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
      chatItem.setAttribute("style", "cursor: pointer;");
      let lastMessageStyle = `<div class="text-truncate last-message"style="color: #000;font-weight:bold">${lastMessage}</div>`;

      chatItem.innerHTML = `
  <div class="chat-details flex-grow-1">
    <div class="d-flex justify-content-between">
      <span class="fw-bold text-capitalize">${userName}</span>
      <small class="text-muted">${currentTime}</small>
    </div>
    ${lastMessageStyle}
  </div>
`;
    const chatList = document.querySelector(".chat-list");
    chatList.prepend(chatItem);
      chatItems = document.querySelectorAll(".chat-item");
      setOnclickChat();
      // chatItem.addEventListener("click", async (e) => {
      //   document.querySelectorAll(".chat-item").forEach((ele) => {
      //     ele.classList.remove("active-chat");
      //   });
      //   const eleChat = $(e.target).closest(".chat-item");
      //   eleChat.addClass("active-chat");
      //   if (currentChatUser) {
      //     socket.emit("leaveRoom", { room: currentChatUser });
      //   }
      //   // Cập nhật phòng mới
      //   currentChatUser = data.sender;
      //   socket.emit("joinRoom", { room: data.sender });
      //   // Hiển thị giao diện chatbox
      //   chatboxContainer.style.display = "block";
      //   chatboxUserName.textContent = userName;
      //   // Lấy tất cả tin nhắn
      //   const allMessages = await getMessagesForUser(data.sender);
      //   chatboxMessages.innerHTML = allMessages
      //     .map(
      //       async (message) => `  
      //       <div class="message" style="display: flex; flex-direction: column; align-items: ${message.receiver ? "flex-end" : "flex-start"
      //         }; margin-top: 5px;">
      //         <div class="message-text last-message d-inline-block p-2 rounded text-dark" 
      //           style="padding: 8px 12px; display: flex; flex-direction: column; background-color: ${message.receiver ? "rgb(219, 235, 255)" : "#f0f0f0"
      //         }; word-break: break-word; overflow-wrap: break-word; max-width: 300px; white-space: normal;">
      //           ${message.content}
      //           <div class="message-time last-message text-muted small" 
      //             style="margin-top: 5px; text-align: left;">
      //             ${new Date(message.timestamp).toLocaleTimeString([], {
      //           hour: "2-digit",
      //           minute: "2-digit",
      //           hour12: false,
      //         })}
      //           </div>
      //         </div>
      //       </div>
      //     `
      //     )
      //     .join("");
      //   chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
      // });
    } else {
      // Nếu cuộc trò chuyện đã tồn tại, chỉ cần cập nhật nội dung tin nhắn cuối cùng và thời gian
      const lastMessageElement =
        existingChatItem.querySelector(".last-message");
      lastMessageElement.textContent = lastMessage;
      lastMessageElement.style.fontWeight = "bold"; // In đậm
      lastMessageElement.style.color = "black"; // Đổi màu thành đen
      document.querySelector(`[data-id="${data.sender}"] small`).textContent =
        currentTime; // Cập nhật thời gian tin nhắn cuối cùng
      // Đẩy phần tử chat đã tồn tại lên đầu danh sách nếu có tin nhắn mới
      const chatList = document.querySelector(".chat-list");
      chatList.prepend(existingChatItem); // Đẩy lên đầu danh sách
    }
  });
  // Lắng nghe sự kiện newMessage từ server
  socket.on("newMessage", async (data) => {
    const isProduct = data.isProduct;
    // Nếu tin nhắn không phải là sản phẩm
    if (!isProduct) {
      const outputHtml = `
      <div class="message" style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 5px;">
        <div class="message-text d-inline-block p-2 rounded text-dark" style="padding: 8px 12px; display: flex; flex-direction: column; background-color: #f0f0f0; word-break: break-word; overflow-wrap: break-word; max-width: 300px; white-space: normal;">
        ${data.message}
            <div class="message-time text-muted last-message small" style="color: #ccc; margin-top: 5px;">
              ${new Date(data.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
            </div>
        </div>
      </div>
    `;
      chatboxMessages.innerHTML += outputHtml;
      chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
      return;
    }
    // Nếu tin nhắn là sản phẩm
    const idVariation = data.message;
    const outputHtml = await createProductMessage(idVariation);
    chatboxMessages.innerHTML += outputHtml;
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
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
async function createProductMessage(idVariation) {
  const response = await fetch(`/api/getInfoProductChat/${idVariation}`);
  let product = await response.json();
  let outputHtml = "";

  if (product.status == "error") {
    outputHtml = `
      <div class="d-flex justify-content-end w-100 text-danger border rounded">
        <p>Lỗi không tìn thấy sản phẩm</p>
      </div>
      `;
  } else {
    product = product.product;
    outputHtml = `
    <div class="d-flex justify-content-center">
      <a class="d-flex justify-content-around w-75 border rounded row" href="${product.link
      }" target="_blank">
          <div class="col">
              <img src="https://res.cloudinary.com/dzagdwvrg/image/upload/v1717484298/uploads/${product.img
      }" alt="" style="width: 100%;height: 100%;">
          </div>
          <div class="col-6">
              <div class="text-ellipsis ">${product.name}</div>
              ${product.discount > 0
        ? `<div class="text-decoration-line-through">${formatVND(
          product.originalPrice
        )}</div>`
        : ""
      }
              <div class="fs-4 text-danger">${formatVND(
        product.discountPrice
      )}</div>
          </div>
      </a>
    </div>
    `;
  }
  return outputHtml;
}
const formatVND = (amount) => {
  const returnValue = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
  return returnValue;
};
