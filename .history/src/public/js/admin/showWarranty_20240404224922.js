function confirmDelete() {
  if (result) {
    console.log("Đã xóa sản phẩm.");
    // Thực hiện các thao tác xóa sản phẩm tại đây
  } else {
    console.log("Đã hủy xóa sản phẩm.");
  }
}

$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    confirmDelete();
  });
});
