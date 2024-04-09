// Lấy các phần tử cần sử dụng
var addCategoryBtn = document.getElementById("addCategoryBtn");
var addCategoryForm = document.querySelector(".add-category-form");
var cancelBtn = document.getElementById("cancelBtn");

// Đăng ký sự kiện click cho nút "Thêm danh mục mới"
addCategoryBtn.addEventListener("click", function () {
  addCategoryForm.classList.remove("d-none"); // Hiển thị form thêm danh mục
});

// Đăng ký sự kiện click cho nút "Hủy"
cancelBtn.addEventListener("click", function () {
  addCategoryForm.classList.add("d-none"); // Ẩn form thêm danh mục
});
