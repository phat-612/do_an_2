document.addEventListener("DOMContentLoaded", function () {
  // Khi cửa sổ modal hiển thị
  $("#addCategoryModal").on("shown.bs.modal", function () {
    // Tự động đặt con trỏ vào trường "Tên danh mục"
    $("#categoryName").focus();
  });

  // Khi nhấp vào nút "Thêm danh mục" trong modal
  $(".modal-footer .btn-primary").on("click", function () {
    const categoryName = $("#categoryName").val();
    const categoryDescription = $("#categoryDescription").val();

    // Hiển thị thông tin nhập vào lên console
    console.log({
      name: categoryName,
      description: categoryDescription,
    });

    // Xóa trường dữ liệu
    $("#categoryName").val("");
    $("#categoryDescription").val("");

    // Đóng cửa sổ modal
    $("#addCategoryModal").modal("hide");
  });
});
