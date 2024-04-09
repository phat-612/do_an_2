$(document).ready(function () {
  // Khi nhấp vào nút "Thêm danh mục mới"
  $(".btn-success").click(function () {
    $("#addCategoryModal").modal({
      backdrop: "static",
      keyboard: false,
    });
  });

  // Khi nhấp vào nút "Thêm danh mục" trong modal
  $(".modal-footer .btn-primary").click(function () {
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
