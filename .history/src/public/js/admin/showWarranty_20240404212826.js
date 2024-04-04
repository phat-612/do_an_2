function confirmDelete() {
  var result = confirm("Bạn có chắc chắn muốn xóa không?");
  if (result) {
    console.log("Đã xóa sản phẩm.");
  } else {
    console.log("Đã hủy xóa sản phẩm.");
  }
}
document.addEventListener("DOMContentLoaded", function () {
  $("btn btn-link").on("show.bs.modal", function (event) {
    const button = $(event.target);
    const id = button.data("id");
  });
});
