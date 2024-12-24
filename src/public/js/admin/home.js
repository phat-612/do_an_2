window.onload = function () {
  countStatus();
};
function countStatus() {
  const countFailed = document.querySelectorAll(".failed").length;
  const countCancel = document.querySelectorAll(".cancel").length;
  const countPending = document.querySelectorAll(".pending").length;
  const countSuccess = document.querySelectorAll(".success").length;
  const shipping = document.querySelectorAll(".shipping").length;

  const data = {
    labels: [
      "Đơn Đã Giao Hàng",
      "Đơn Chờ Xác Nhận",
      "Đơn Hàng Thất Bại",
      "Đã Hủy",
      "Đang Giao Hàng",
    ],
    datasets: [
      {
        label: "Trạng thái đơn hàng",
        data: [countSuccess, countPending, countFailed, countCancel, shipping],
        backgroundColor: [
          "rgb(25, 135, 84)",
          "rgb(255, 193, 7)",
          "rgb(220, 53, 69)",
          "rgb(150, 10, 150)",
          "rgb(15, 100, 250)",
        ],
        hoverOffset: 5,
      },
    ],
  };

  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: data,
  });
}
