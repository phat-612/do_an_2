// const socket = io.connect("http://localhost:3000");
socket.on("connect", async function () {
  console.log(`Đã kết nối tới server với ID: ${room}`);
  socket.emit("joinRoom", { room });

  // Hiển thị thông báo tham gia phòng
  const joinMessageElement = `
      <div class="mb-2 d-flex justify-content-center">
        <div class="d-flex align-items-center">
        <p></p>
          <div class="p-2 rounded bg-info text-white">Chúng tôi sẽ hỗ trợ bạn sớm nhất</div>
        </div>
      </div>`;
  $("#chatboxBody").append(joinMessageElement);
  $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);

  // Lấy tin nhắn lịch sử
  try {
    const messages = await getMessagesForUser(room);
    messages.forEach((msg) => {
      const isSender = !msg.receiver || msg.receiver === ""; // Kiểm tra vị trí dựa vào receiver
      const messageElement = `
          <div class="mb-2 d-flex ${
            isSender ? "justify-content-end" : "justify-content-start"
          }">
            <div class="d-flex align-items-center">
              ${
                !isSender
                  ? `<img src="https://via.placeholder.com/30" class="rounded-circle me-2" alt="Avatar" />`
                  : ""
              }
              <div class="p-2 rounded ${
                isSender ? "bg-primary text-white" : "bg-light"
              }">
                ${msg.content}
                <div class="text-muted small mt-1">${msg.timestamp}</div>
              </div>
            </div>
          </div>`;
      $("#chatboxBody").append(messageElement);
    });
    $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);
  } catch (error) {
    console.error("Không thể tải tin nhắn:", error);
  }
});

socket.on("newMessage", function (data) {
  const isSender = !data.receiver || data.receiver === ""; // Kiểm tra receiver
  const messageElement = `
      <div class="mb-2 d-flex ${
        isSender ? "justify-content-end" : "justify-content-start"
      }">
        <div class="d-flex align-items-center">
          ${
            !isSender
              ? `<img src="https://via.placeholder.com/30" class="rounded-circle me-2" alt="Avatar" />`
              : ""
          }
          <div class="p-2 rounded ${
            isSender ? "bg-primary text-white" : "bg-light"
          }">
            ${data.message}
            <div class="text-muted small mt-1">${data.timestamp}</div>
          </div>
        </div>
      </div>`;
  $("#chatboxBody").append(messageElement);
  $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);
});

// Khi người dùng nhấn nút gửi tin nhắn
$("#sendMessage").click(function () {
  const message = $("#chatInput").val();
  if (message) {
    console.log("Gửi tin nhắn:", message);
    socket.emit("sendMessage", {
      message: message,
      sender: room,
      receiver: "",
      room: room,
    });
    const messageElement = `
        <div class="mb-2 d-flex justify-content-end">
          <div class="d-flex align-items-center">
            <div class="p-2 rounded bg-primary text-white">
              ${message}
              <div class="text-muted small mt-1">Now</div>
            </div>
          </div>
        </div>`;
    $("#chatboxBody").append(messageElement);
    $("#chatInput").val("");
    $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);
  }
});

$("#chatInput").keypress(function (e) {
  if (e.which == 13) {
    $("#sendMessage").click();
  }
});

let isLoadingMessages = false;

async function getMessagesForUser(room) {
  if (isLoadingMessages) return;
  isLoadingMessages = true;

  try {
    const response = await fetch(`/api/user/meMessages/${room}`);
    if (!response.ok) {
      throw new Error("Không thể tải tin nhắn");
    }
    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    isLoadingMessages = false;
  }
}
