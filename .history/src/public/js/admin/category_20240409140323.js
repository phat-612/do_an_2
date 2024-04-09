document.addEventListener("DOMContentLoaded", function () {
  // Khi cửa sổ modal hiển thị
  document
    .getElementById("addCategoryModal")
    .addEventListener("shown.bs.modal", function () {
      // Tự động đặt con trỏ vào trường "Tên danh mục"
      document.getElementById("categoryName").focus();
    });

  // Khi nhấp vào nút "Thêm danh mục" trong modal
  document
    .querySelector(".modal-footer .btn-primary")
    .addEventListener("click", function () {
      const categoryName = document.getElementById("categoryName").value;
      const categoryDescription = document.getElementById(
        "categoryDescription"
      ).value;

      // Hiển thị thông tin nhập vào lên console
      console.log({
        name: categoryName,
        description: categoryDescription,
      });

      // Xóa trường dữ liệu
      document.getElementById("categoryName").value = "";
      document.getElementById("categoryDescription").value = "";

      // Đóng cửa sổ modal
      const modal = document.getElementById("addCategoryModal");
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      bootstrapModal.hide();
    });
});
