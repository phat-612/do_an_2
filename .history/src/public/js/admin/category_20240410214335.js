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
// Lấy tất cả các phần tử có class "edit-category-btn"
const editButtons = document.querySelectorAll(".edit-category-btn");

// Lặp qua tất cả các nút "Sửa" và gắn sự kiện click
editButtons.forEach((button) => {
  button.addEventListener("click", handleEditCategory);
});

// Xử lý sự kiện khi nhấp vào nút "Sửa"
function handleEditCategory(event) {
  event.preventDefault();

  // Lấy ID của danh mục từ thuộc tính data-id
  // const categoryId = event.target.dataset.id;
}
