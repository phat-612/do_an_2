function confirmDelete() {
  var result = confirm("Bạn có chắc chắn muốn xóa không?");
  if (result) {
    $(document).ready(function () {
      $(".deleteWarranty").on("click", function (event) {
        event.preventDefault();
        confirmDelete();
      });
    });

    // Thực hiện các thao tác xóa sản phẩm tại đây
  } else {
    console.log("Đã hủy xóa sản phẩm.");
  }
}
