function confirmDelete() {
  var result = confirm("Bạn có chắc chắn muốn xóa không?");
  if (result) {
    console.log("Đã xóa sản phẩm.");
  } else {
    console.log("Đã hủy xóa sản phẩm.");
  }
}
