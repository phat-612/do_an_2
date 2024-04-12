$(document).ready(function () {
  // Khi nhấp vào một nút nào đó (thay thế '.btn-success' với class/ID của nút mà bạn muốn)
  $(".btn-success").click(function () {
    // Hiển thị cửa sổ modal
    $("#exampleModal").modal("show");
  });

  // Khi form được submit
  $("#form").submit(function (event) {
    // Ngăn chặn hành vi mặc định của việc submit form
    event.preventDefault();

    // Lấy dữ liệu từ các trường của form
    let name = $("#name").val();
    let idParent = $("#idParent").val();

    // Xử lý lưu dữ liệu tại đây
    // ví dụ: gửi dữ liệu lên server thông qua AJAX
    $.ajax({
      type: "POST",
      url: "/api/storeCategory", // thay đổi url phù hợp với bạn
      data: {
        name: name,
        idParent: idParent,
      },
      success: function (res) {
        // xử lý khi gửi thành công
        console.log("Lưu thành công");

        // Đóng cửa sổ modal
        $("#exampleModal").modal("hide");

        // Làm mới dữ liệu sau khi lưu
        $("#name").val("");
        $("#idParent").val("");
      },
      error: function (err) {
        // xử lý khi có lỗi xảy ra
        console.log(err);
      },
    });
  });

  // Khi nhấp vào nút "Hủy" trong modal
  $("#exampleModal .modal-footer .btn-secondary").click(function () {
    // Xóa trường dữ liệu
    $("#name").val("");
    $("#idParent").val("");

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
