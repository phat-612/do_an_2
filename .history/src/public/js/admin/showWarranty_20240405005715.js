$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var result = confirm("Bạn có chắc chắn muốn xóa không?");
    if (result) {
      var id = $(this).data("id"); // Sửa đổi dòng này
      console.log(id);
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
document
  .getElementById("warrantyDelete")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Form đã được submit!");
    // code để xử lý gửi yêu cầu xóa
  });
