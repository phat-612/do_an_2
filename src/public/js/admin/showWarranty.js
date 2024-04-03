function confirmDelete() {
  var result = confirm("Bạn có chắc chắn muốn xóa không?");
  if (result) {
    // Xử lý khi người dùng chọn "Xóa"
    // Thực hiện các hành động xóa tại đây
    console.log("Đã xóa sản phẩm.");
  } else {
    // Xử lý khi người dùng chọn "Hủy"
    console.log("Đã hủy xóa sản phẩm.");
  }
}
