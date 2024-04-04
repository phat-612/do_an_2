function confirmDelete() {
  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    // Lấy đường dẫn của liên kết
    var deleteUrl = event.target.href;

    // Gửi yêu cầu DELETE đến đường dẫn xóa
    fetch(deleteUrl, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Đã xóa bảo hành thành công");
          // Thực hiện các hành động sau khi xóa thành công, ví dụ như làm mới trang
        } else {
          console.log("Lỗi khi xóa bảo hành");
          // Xử lý lỗi khi xóa không thành công
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    console.log("Hủy xóa");
  }
}
