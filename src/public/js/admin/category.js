var addCategoryBtn = document.getElementById("addCategoryBtn");
var addCategoryForm = document.querySelector(".add-category-form");
var cancelBtn = document.getElementById("cancelBtn");

addCategoryBtn.addEventListener("click", function () {
  addCategoryForm.classList.remove("d-none");
});

cancelBtn.addEventListener("click", function () {
  addCategoryForm.classList.add("d-none");
});
