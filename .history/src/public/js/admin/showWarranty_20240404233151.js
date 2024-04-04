$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var deleteLink = $(this).attr("href");
    var result = confirm("Bạn có chắc chắn muốn xóa không?");
    if (result) {
      console.log("Đã xóa sản phẩm.");
      // Thực hiện các thao tác xóa sản phẩm tại đây

      // Chuyển hướng đến đường dẫn xóa bảo hành
      window.location.href = deleteLink;
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
