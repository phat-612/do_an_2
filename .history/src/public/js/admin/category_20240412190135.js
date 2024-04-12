// Hàm chỉ chạy khi tài liệu đã hoàn tất việc tải.
let addCateModal = document.getElementById("exampleModal");
addCateModal.addEventListener("show.bs.modal", function (event) {
  let button = event.relatedTarget;
  let idCategory = button.getAttribute("data-id");
  let name = button.getAttribute("data-name");
  let idParent = button.getAttribute("data-idParent");

  let form = addCateModal.querySelector("#form");

  if (idCategory) {
    // Thiết lập giá trị cho các trường trong modal và định vị form action để cập nhật
    addCateModal.querySelector("#name").value = name;
    addCateModal.querySelector("#idParent").value = idParent;
    form.action = "/api/updateCategory/" + idCategory;
  } else {
    // Xóa giá trị từ các trường và thiết lập form action để tạo mới
    addCateModal.querySelector("#name").value = "";
    addCateModal.querySelector("#idParent").value = "";
    form.action = "/api/storeCategory";
  }
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
