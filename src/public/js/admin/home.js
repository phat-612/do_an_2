const data = {
  labels: ["Đơn Đã Giao Hàng", "Đơn Chờ Xác Nhận", "Đang Vận Chuyển", "Đã Hủy"],
  datasets: [
    {
      label: "My First Dataset",
      data: [25, 25, 30, 20],
      backgroundColor: [
        "rgb(25, 135, 84)",
        "rgb(255, 193, 7)",
        "rgb(220, 53, 69)",
        "rgb(200, 10, 20)",
      ],
      hoverOffset: 4,
    },
  ],
};

new Chart("chart", {
  type: "doughnut",
  data: data,
});

// giới hạn ngày nhập =================================================================

let dateStart = document.querySelector(".dateStart");
let dateEnd = document.querySelector(".dateEnd");
let btngotoDate = document.querySelector(".btn-gotoDate");
// Tạo một đối tượng Date để lấy ngày hiện tại
let currentDate = new Date();
let year = currentDate.getFullYear(); // Lấy thông tin về ngày, tháng và năm
let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Chuyển tháng thành chuỗi và thêm số 0 ở đầu nếu cần
let day = String(currentDate.getDate()).padStart(2, "0"); // Chuyển ngày thành chuỗi và thêm số 0 ở đầu nếu cần
let formattedDate = year + "-" + month + "-" + day; // Tạo chuỗi đại diện cho ngày hiện tại (định dạng YYYY-MM-DD)
dateStart.max = formattedDate;
dateStart.addEventListener("change", () => {
  if (dateStart.value == "") {
    dateEnd.disabled = true;
  } else {
    dateEnd.disabled = false;
    dateEnd.min = dateStart.value;
    dateEnd.max = formattedDate;
  }
});
dateEnd.addEventListener("change", () => {
  if (dateEnd.value == "") {
    btngotoDate.disabled = true;
  } else {
    btngotoDate.disabled = false;
  }
});
