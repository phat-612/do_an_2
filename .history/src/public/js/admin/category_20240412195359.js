document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-category-btn");
  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const name = button.dataset.name;
      const idParent = button.dataset.idParent;
      const id = button.dataset.id;

      // Điền thông tin vào modal
      const nameInput = document.getElementById("name");
      const idParentSelect = document.getElementById("idParent");
      nameInput.value = name;
      idParentSelect.value = idParent;

      // Hiển thị modal
      const modal = new bootstrap.Modal(
        document.getElementById("addCategoryModal")
      );
      modal.show();
    });
  });
});
// $(document).ready(function () {
//   // Đặt sự kiện khi nút "Thêm danh mục mới" được nhấn.
//   $(".btn-success").on("click", function (e) {
//     // Chắc chắn rằng nút không làm submit form.
//     e.preventDefault();
//     // Làm sạch form để có thể thêm danh mục mới.
//     // Đặt giá trị của các trường trong form về rỗng.
//     $("#name").val("");
//     $("#idParent").val("");

//     // Mở lên modal để thêm danh mục.
//     $("#exampleModal").modal("show");
//   });

//   // Sự kiện khi nút "Hủy" được nhấp
//   $(".btn-cancel").on("click", function (e) {
//     // Chắc chắn rằng nút không làm submit form.
//     e.preventDefault();

//     // Đóng modal.
//     $("#exampleModal").modal("hide");
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
  $(".edit-category-btn").on("click", function () {
    var categoryId = $(this).data("id");

    $("#editCategoryModal").modal("show");

    // Thiết lập action của form dựa trên ID của danh mục
    var form = $("#editCategoryModal").find("form");
    var actionUrl = "/api/category/" + categoryId + "?_method=PUT";
    form.attr("action", actionUrl);
    return false;
  });

  // Bắt sự kiện click trên nút "Lưu" trong modal
  $("#editCategoryModal").on("click", ".btn-primary", function () {
    // Gửi yêu cầu PUT để cập nhật danh mục
    $("form#editCategoryForm").submit();
  });

  // Bắt sự kiện click trên nút "Hủy" trong modal
  $("#editCategoryModal").on("click", ".btn-secondary", function () {
    // Ẩn modal
    $("#editCategoryModal").modal("hide");
    return false;
  });
});
