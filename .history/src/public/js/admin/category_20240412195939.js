document.addEventListener("DOMContentLoaded", function () {
  const categoryModal = document.getElementById("addCategoryModal");
  const cancelButton = categoryModal.querySelector(".btn-secondary");

  // Xử lý sự kiện nhấp vào nút "Hủy"
  cancelButton.addEventListener("click", function () {
    categoryModal.classList.remove("show");
  });

  categoryModal.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let idCategory = button.getAttribute("data-id");
    if (idCategory) {
      let nameCategory = button.getAttribute("data-name");
      let idParent = button.getAttribute("data-idParent");
      categoryModal.querySelector("#name").value = nameCategory;
      categoryModal.querySelector("#idParent").value = idParent;
    } else {
      categoryModal.querySelector("#name").value = "";
      categoryModal.querySelector("#idParent").value = "";
    }
    categoryModal.classList.add("show");
  });

  const addCategoryButton = document.querySelector(".btn.btn-success");
  addCategoryButton.addEventListener("click", function () {
    categoryModal.classList.add("show");
  });

  const editButtons = document.querySelectorAll(".edit-category-btn");
  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const name = button.getAttribute("data-name");
      const idParent = button.getAttribute("data-idParent");
      const id = button.getAttribute("data-id");

      // Điền thông tin vào modal
      categoryModal.querySelector("#name").value = name;
      categoryModal.querySelector("#idParent").value = idParent;

      // Hiển thị modal
      categoryModal.classList.add("show");
    });
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
