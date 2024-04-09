$(document).ready(function () {
  // Khi nhấp vào nút "Thêm danh mục mới"
  $(".btn-success").click(function () {
    $("#addCategoryModal").modal("show");
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

  // Khi nhấp vào nút "Hủy" trong modal
  $(".modal-footer .btn-secondary").click(function () {
    // Xóa trường dữ liệu
    $("#categoryName").val("");
    $("#categoryDescription").val("");

    // Đóng cửa sổ modal
    $("#addCategoryModal").modal("hide");
  });
});
// Lấy tất cả các nút "Xóa"
var deleteButtons = document.querySelectorAll(".btn-danger");

// Duyệt qua từng nút "Xóa" và gán hành động
deleteButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    // Thực hiện các hành động khi nhấp vào nút "Xóa"
    console.log('Đã nhấp vào nút "Xóa"');
  });
});
