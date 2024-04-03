const data = {
  labels: ["Đơn Mới Đang Chờ Xủ Lý", "Đơn Chờ xử Lý", "Hết Hàng"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(25, 135, 84)",
        "rgb(255, 193, 7)",
        "rgb(220, 53, 69)",
      ],
      hoverOffset: 4,
    },
  ],
};

new Chart("chart", {
  type: "doughnut",
  data: data,
});
