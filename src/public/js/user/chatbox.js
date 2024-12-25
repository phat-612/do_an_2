/*
var room = "{{session.idUser}}";
if (!room) {
  // Hiển thị chatboxnotlogin
  const chatboxNotLogin = document.getElementById("chatboxnotlogin");
  chatboxNotLogin.style.display = "block";

  // Xử lý sự kiện click vào nút mở chatbox
  const chatboxToggle = chatboxNotLogin.querySelector("#chatboxToggle");
  chatboxToggle.addEventListener("click", function () {
    // Hiển thị modal yêu cầu đăng nhập
    const loginModal = new bootstrap.Modal(
      document.getElementById("loginModal")
    );
    loginModal.show();
  });

  // Xử lý nút "Đăng nhập" trong modal
  document.getElementById("goToLogin").addEventListener("click", function () {
    window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
  });
} else {
  // Xử lý nếu đã đăng nhập
  const chatboxContainer = document.getElementById("chatboxContainer");
  chatboxContainer.querySelector("#chatboxToggle").style.display = "block";

  // Thêm sự kiện mở chatbox
  chatboxContainer
    .querySelector("#chatboxToggle")
    .addEventListener("click", function () {
      const chatbox = document.getElementById("chatbox");
      chatbox.style.display = "none"; // Đóng chatbox
      document.getElementById("chatboxToggle").style.display = "block";

      // Cuộn nội dung xuống cuối
      setTimeout(() => {
        document.getElementById("chatboxBody").scrollTop =
          document.getElementById("chatboxBody").scrollHeight;
      }, 100);
    });
}
document.getElementById("chatboxToggle").addEventListener("click", function () {
  document.getElementById("chatbox").style.display = "block";
  document.getElementById("chatboxToggle").style.display = "none";
  setTimeout(() => {
    document.getElementById("chatboxBody").scrollTop =
      document.getElementById("chatboxBody").scrollHeight;
  }, 100);
});

socket.on("connect", async function () {
  socket.emit("joinRoom", { room });

  // Hiển thị thông báo tham gia phòng
  const joinMessageElement = `
      <div class="mb-2 d-flex justify-content-center">
        <div class="d-flex align-items-center">
          <div class="p-2 rounded bg-info text-white">Chúng tôi sẽ hỗ trợ bạn sớm nhất</div>
        </div>
      </div>`;
  $("#chatboxBody").append(joinMessageElement);
  $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);

  // Lấy tin nhắn lịch sử
  const messages = await getMessagesForUser(room);
  if (messages.length > 0) {
    const messageTime = new Date(
      messages[0].timestamp.replace(
        /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/,
        "$3-$2-$1T$4:$5:00"
      )
    );
    const day = messageTime.getDate().toString().padStart(2, "0");
    const month = (messageTime.getMonth() + 1).toString().padStart(2, "0");
    const year = messageTime.getFullYear();
    const hours = messageTime.getHours().toString().padStart(2, "0");
    const minutes = messageTime.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;

    const timeElement = `
      <div class="text-center text-muted small mb-2">
        ${formattedTime}
      </div>`;
    $("#chatboxBody").append(timeElement);
  }

  messages.forEach((msg) => {
    const messageTime = new Date(msg.timestamp);
    const hours = messageTime.getHours().toString().padStart(2, "0");
    const minutes = messageTime.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;
    const isSender = !msg.receiver || msg.receiver === "";
    const messageElement = `
    <div class="mb-2 d-flex ${
      isSender ? "justify-content-end" : "justify-content-start"
    }">
      <div class="d-flex align-items-center">
        <div class="p-2 rounded message-box" style="${
          isSender
            ? "background-color: rgb(219, 235, 255);"
            : "background-color: #f0f0f0"
        }; word-break: break-word; max-width: 200px;">
          ${msg.content}
          <div class="text-muted small mt-1">${formattedTime}</div>
        </div>
      </div>
    </div>`;

    $("#chatboxBody").append(messageElement);
  });
  $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);
});

socket.on("newMessage", function (data) {
  const isSender = !data.receiver || data.receiver === "";
  const messageTime = new Date(data.timestamp);
  const hours = messageTime.getHours().toString().padStart(2, "0");
  const minutes = messageTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;
  const messageElement = `
  <div class="mb-2 d-flex ${
    isSender ? "justify-content-end" : "justify-content-start"
  }">
    <div class="d-flex align-items-center">
      <div class="p-2 rounded message-box ${
        isSender ? "bg-primary text-white" : ""
      }" 
        style="background-color: ${
          isSender ? "rgb(219, 235, 255)" : "#f0f0f0"
        }; word-break: break-word; max-width: 200px;">
        ${data.message}
        <div class="text-muted small mt-1">${formattedTime}</div>
      </div>
    </div>
  </div>`;

  $("#chatboxBody").append(messageElement);
  $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);
});

let lastMessageTime = null;

async function getLastMessageTime() {
  const timeMessages = await getMessagesForUser(room);
  if (timeMessages.length === 0) {
    return;
  }
  const lastMessage = timeMessages[timeMessages.length - 1];
  lastMessageTime = new Date(lastMessage.timestamp);
}
getLastMessageTime();

// Hàm gửi tin nhắn
function sendMessage() {
  const message = $("#chatInput").val();
  const currentTime = new Date();
  if (message) {
    socket.emit("sendMessage", {
      message: message,
      sender: room,
      receiver: "",
      room: room,
      time: currentTime.toISOString(),
      isFirstMessage: true,
    });

    const day = currentTime.getDate().toString().padStart(2, "0");
    const month = (currentTime.getMonth() + 1).toString().padStart(2, "0");
    const year = currentTime.getFullYear();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;
    const formattedTimeNotYear = `${hours}:${minutes}`;
    let messageElement = "";

    if (lastMessageTime) {
      const timeDifference = (currentTime - lastMessageTime) / (1000 * 60);
      if (timeDifference > 30) {
        messageElement += `
      <div class="text-center text-muted small mb-2">
        ${formattedTime}
      </div>`;
      }
    }
    messageElement += `
  <div class="mb-2 d-flex justify-content-end">
    <div class="d-flex align-items-center">
      <div class="p-2 rounded message-box text-black"
        style="background-color: rgb(219, 235, 255); word-break: break-word; max-width: 200px;">
        ${message}
        <div class="text-muted small mt-1">${formattedTimeNotYear}</div>
      </div>
    </div>
  </div>`;

    $("#chatboxBody").append(messageElement);
    $("#chatboxBody").scrollTop($("#chatboxBody")[0].scrollHeight);
    $("#chatInput").val("");
  }
}

// Sự kiện click vào nút gửi
$("#sendMessage").click(function () {
  sendMessage();
});

// Sự kiện nhấn Enter trong ô nhập liệu
$("#chatInput").keypress(function (event) {
  if (event.which === 13) {
    // Kiểm tra nếu phím Enter (keyCode 13) được nhấn
    event.preventDefault(); // Ngừng hành vi mặc định của Enter (ví dụ: tạo dòng mới)
    sendMessage();
  }
});

async function getMessagesForUser(room) {
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
  }
}
// Đóng chatbox khi nhấn nút đóng
document.getElementById("closeChat").addEventListener("click", function () {
  document.getElementById("chatbox").style.display = "none";
  document.getElementById("chatboxToggle").style.display = "block";
});
*/

function showChatboxNotLogin() {
  const chatboxNotLogin = document.getElementById("chatboxnotlogin");
  chatboxNotLogin.style.display = "block";

  const chatboxToggle = chatboxNotLogin.querySelector("#chatboxToggle");
  chatboxToggle.addEventListener("click", () => {
    const loginModal = new bootstrap.Modal(
      document.getElementById("loginModal")
    );
    loginModal.show();
  });

  document.getElementById("goToLogin").addEventListener("click", () => {
    window.location.href = "/login";
  });
}

function showChatboxContainer() {
  const chatboxContainer = document.getElementById("chatboxContainer");
  chatboxContainer.querySelector("#chatboxToggle").style.display = "block";

  chatboxContainer
    .querySelector("#chatboxToggle")
    .addEventListener("click", () => {
      const chatbox = document.getElementById("chatbox");
      chatbox.style.display = "none";
      document.getElementById("chatboxToggle").style.display = "block";
      scrollToBottom("chatboxBody");
    });
}

function scrollToBottom(elementId) {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    element.scrollTop = element.scrollHeight;
  }, 100);
}

function formatTime(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatTimeWithoutYear(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

async function getMessagesForUser(room) {
  try {
    const response = await fetch(`/api/user/meMessages/${room}`);
    if (!response.ok) {
      throw new Error("Không thể tải tin nhắn");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function appendMessageElement(messageElement) {
  $("#chatboxBody").append(messageElement);
  scrollToBottom("chatboxBody");
}

function createMessageElement(msg, isSender) {
  const isProduct = !!msg.isProduct;
  if (!msg.content) {
    msg.content = msg.message;
  }

  const messageTime = new Date(msg.timestamp);
  const formattedTime = formatTimeWithoutYear(messageTime);
  return `
    <div class="mb-2 d-flex ${
      isSender ? "justify-content-end" : "justify-content-start"
    }" data-idMessage="${msg._id}">
      <div class="d-flex align-items-center">
        <div class="p-2 rounded message-box" style="${
          isSender
            ? "background-color: rgb(219, 235, 255);"
            : "background-color: #f0f0f0"
        }; word-break: break-word; max-width: 200px;">
          ${isProduct ? "Đang tải thông tin sản phẩm..." : msg.content}
          <div class="text-muted small mt-1">${formattedTime}</div>
        </div>
      </div>
    </div>`;
}

function handleNewMessage(data) {
  const isSender = !data.receiver || data.receiver === "";
  const messageElement = createMessageElement(data, isSender);
  appendMessageElement(messageElement);
}

async function handleSocketConnect() {
  socket.emit("joinRoom", { room });
  let messages = await getMessagesForUser(room);
  if (messages.length > 0) {
    const firstMessageTime = new Date(messages[0].timestamp);
    const formattedTime = formatTime(firstMessageTime);
    const timeElement = `<div class="text-center text-muted small mb-2">${formattedTime}</div>`;
    appendMessageElement(timeElement);
  }

  let eleMessages = messages.map((msg) => {
    const isSender = !msg.receiver || msg.receiver === "";
    const messageElement = createMessageElement(msg, isSender);
    return messageElement;
  });
  eleMessages = eleMessages.join("");
  appendMessageElement(eleMessages);
  // lazy loading thông sản phẩm cần tư vấn thêm
  messages.reverse().forEach(async (msg) => {
    if (msg.isProduct) {
      const productElement = await createProductMessage(msg.content);
      const messageBox = document.querySelector(
        `[data-idMessage="${msg._id}"]`
      );
      messageBox.outerHTML = productElement;
    }
  });
  //   tạo một element mới và thêm vào cuối chatbox (chứa hình ảnh, tên và giá sản phẩm)
  if (isDetailPage) {
    const { productName, originalPrice, discountPrice, productImage } =
      getProductInfo();
    const productElement = `
    <div class="d-flex justify-content-center row">
        <a class="d-flex justify-content-around w-75 border rounded row" target="_blank">
            <div class="col">
                <img src="${productImage}" alt="" style="width: 100%;height: 100%;">
            </div>
            <div class="col-6">
                <div class="text-ellipsis ">${productName}</div>
                ${
                  originalPrice
                    ? `<div class="text-decoration-line-through">${originalPrice}</div>`
                    : ""
                }
                <div class="fs-4 text-danger">${discountPrice}</div>
            </div>
        </a>
    <button id="btnQuestion" class="btn w-75 bg-danger text-white col-12" onclick="questionProduct()">Trao đổi về sản phẩm này</button>       
    </div>
    
    `;
    $("#chatboxBody").append(productElement);
  }
}
function questionProduct() {
  const currentTime = new Date();
  const message = idVariation;
  socket.emit("sendMessage", {
    message,
    sender: room,
    receiver: "",
    isProduct: true,
    room,
    time: currentTime.toISOString(),
    isFirstMessage: true,
  });
  //   ẩn nút hỏi
  $("#btnQuestion").hide();
}
function sendMessage() {
  const message = $("#chatInput").val();
  const currentTime = new Date();
  if (message) {
    socket.emit("sendMessage", {
      message,
      sender: room,
      receiver: "",
      room,
      time: currentTime.toISOString(),
      isFirstMessage: true,
    });

    const formattedTime = formatTime(currentTime);
    const formattedTimeNotYear = formatTimeWithoutYear(currentTime);
    let messageElement = "";

    if (lastMessageTime) {
      const timeDifference = (currentTime - lastMessageTime) / (1000 * 60);
      if (timeDifference > 30) {
        messageElement += `<div class="text-center text-muted small mb-2">${formattedTime}</div>`;
      }
    }
    messageElement += `
      <div class="mb-2 d-flex justify-content-end">
        <div class="d-flex align-items-center">
          <div class="p-2 rounded message-box text-black" style="background-color: rgb(219, 235, 255); word-break: break-word; max-width: 200px;">
            ${message}
            <div class="text-muted small mt-1">${formattedTimeNotYear}</div>
          </div>
        </div>
      </div>`;
    appendMessageElement(messageElement);
    $("#chatInput").val("");
  }
}
function getProductInfo() {
  const productName = $("#productName").text();
  const originalPrice = $("#originalPrice").text();
  const discountPrice = $("#discountPrice").text();
  const productImage = $(".productImage").attr("src");
  return { productName, originalPrice, discountPrice, productImage };
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
        <a class="d-flex justify-content-around w-75 border rounded row" href="${
          product.link
        }" target="_blank">
            <div class="col">
                <img src="https://res.cloudinary.com/dzagdwvrg/image/upload/v1717484298/uploads/${
                  product.img
                }" alt="" style="width: 100%;height: 100%;">
            </div>
            <div class="col-6">
                <div class="text-ellipsis ">${product.name}</div>
                ${
                  product.discount > 0
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
// main
let currentURL = window.location.href;
let host = window.location.host + "/product";
const isDetailPage = !!currentURL.split(host)[1];
let lastMessageTime;
if (!room) {
  showChatboxNotLogin();
} else {
  showChatboxContainer();
}

socket.on("connect", handleSocketConnect);
socket.on("newMessage", handleNewMessage);

async function getLastMessageTime() {
  const timeMessages = await getMessagesForUser(room);
  if (timeMessages.length === 0) {
    return;
  }
  lastMessageTime = new Date(timeMessages[timeMessages.length - 1].timestamp);
}
getLastMessageTime();
$("#sendMessage").click(sendMessage);
$("#chatInput").keypress((event) => {
  if (event.which === 13) {
    event.preventDefault();
    sendMessage();
  }
});
document.getElementById("chatboxToggle").addEventListener("click", () => {
  document.getElementById("chatbox").style.display = "block";
  document.getElementById("chatboxToggle").style.display = "none";
  scrollToBottom("chatboxBody");
});
document.getElementById("closeChat").addEventListener("click", () => {
  document.getElementById("chatbox").style.display = "none";
  document.getElementById("chatboxToggle").style.display = "block";
});
