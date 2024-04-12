$(document).ready(function () {
  // Khi nhấp vào một nút nào đó (thay thế '.btn-success' với class/ID của nút mà bạn muốn)
  $(".btn-success").click(function () {
    // Hiển thị cửa sổ modal
    $("#exampleModal").modal("show");
  });

  // Khi nhấp vào nút "Lưu"
  $(".btn-primary").click(function (event) {
    // Ngăn chặn hành vi mặc định của nút submit
    event.preventDefault();

    // Tiến hành code để xử lý việc lưu dữ liệu tại đây

    // Đóng cửa sổ modal
    $("#exampleModal").modal("hide");
  });

  // Khi nhấp vào nút "Đóng" trong modal
  $("#exampleModal .modal-footer .btn-secondary").click(function () {
    // Xóa trường dữ liệu
    $("#recipient-name").val("");
    $("#message-text").val("");

    // Đóng cửa sổ modal
    $("#exampleModal").modal("hide");
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
