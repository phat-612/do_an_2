document.addEventListener("DOMContentLoaded", function () {
  const categoryModal = document.getElementById("addCategoryModal");

  categoryModal.addEventListener("show.bs.modal", function (event) {
    // set
    let button = event.relatedTarget;
    // console.log(button);
    let linkAction = button.getAttribute("data-linkAction");
    categoryModal.querySelector("form").action = linkAction;
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
  });

  // const addCategoryButton = document.getElementById("addCategoryButton");
  // addCategoryButton.addEventListener("click", function (event) {
  //   event.preventDefault(); // Ngăn chặn hành vi mặc định của nút
  //   const modal = new bootstrap.Modal(categoryModal);
  //   modal.show();
  // });

  const editButtons = document.querySelectorAll(".edit-category-btn");
  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const name = button.getAttribute("data-name");
      const idParent = button.getAttribute("data-idParent");
      // const id = button.getAttribute("data-id");

      // Điền thông tin vào modal
      categoryModal.querySelector("#name").value = name;
      categoryModal.querySelector("#idParent").value = idParent;
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
