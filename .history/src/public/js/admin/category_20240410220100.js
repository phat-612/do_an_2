$(document).ready(function () {
  // Khi nhấp vào nút "Thêm danh mục mới"
  $(".btn-success").click(function () {
    $("#addCategoryModal").modal("show");
  });

  // Khi nhấp vào nút "Thêm danh mục" trong modal
  $(".modal-footer .btn-primary").click(function () {
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
// deleteButtons.forEach(function (button) {
//   button.addEventListener("click", function (event) {
//     // Thực hiện các hành động khi nhấp vào nút "Xóa"
//     console.log('Đã nhấp vào nút "Xóa"');
//   });
// });
// xóa
var categoryId;
var btnDelete = document.querySelectorAll(".btn-danger");
var deleteForm = document.forms["categoryDelete"];

btnDelete.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    categoryId = this.getAttribute("data-id");
    var confirmed = confirm("Bạn có chắc chắn muốn xóa danh mục này?");
    if (confirmed) {
      deleteForm.action = "/api/category/" + categoryId + "?_method=DELETE";
      deleteForm.submit();
    }
  });
});
// Xử lý sự kiện nhấp vào nút "Sửa"
$(document).ready(function () {
  // Bắt sự kiện click trên nút "Sửa"
  $(".edit-category-btn").on("click", function () {
    // Lấy ID của danh mục từ thuộc tính data-id
    var categoryId = $(this).data("id");

    // Hiển thị modal
    $("#editCategoryModal").modal("show");

    // Thực hiện các hành động khác khi cần thiết
    // ...

    // Ngăn chặn hành vi mặc định của nút
    return false;
  });

  // Bắt sự kiện click trên nút "Hủy" trong modal
  $("#editCategoryModal").on("click", ".btn-secondary", function () {
    // Ẩn modal
    $("#editCategoryModal").modal("hide");

    // Thực hiện các hành động khác khi cần thiết
    // ...

    // Ngăn chặn hành vi mặc định của nút
    return false;
  });
});
