document.addEventListener("DOMContentLoaded", function () {
  const categoryModal = document.getElementById("addCategoryModal");
  const cancelButton = categoryModal.querySelector(".btn-secondary");

  // Xử lý sự kiện nhấp vào nút "Hủy"
  cancelButton.addEventListener("click", function () {
    categoryModal.classList.add("modal-hidden");
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
    categoryModal.classList.remove("modal-hidden");
  });

  const addCategoryButton = document.querySelector(".btn.btn-success");
  addCategoryButton.addEventListener("click", function () {
    categoryModal.classList.remove("modal-hidden");
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
      categoryModal.classList.remove("modal-hidden");
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
