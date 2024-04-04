function confirmDelete() {
  var result = confirm("Bạn có chắc chắn muốn xóa không?");
  if (result) {
    console.log("Đã xóa sản phẩm.");
  } else {
    console.log("Đã hủy xóa sản phẩm.");
  }
}

$(document).ready(function () {
  $(".btn.btn-link").on("click", function (event) {
    event.preventDefault();
    const id = $(this).data("id");
    confirmDelete();
    // Tiếp tục thực hiện các thao tác khác liên quan đến hành động xóa sản phẩm
    // Sử dụng giá trị 'id' nếu cần thiết
  });
});
