$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var result = confirm("Bạn có chắc chắn muốn xóa không?");
    if (result) {
      var id = $(this).data("id");
      console.log(id);
      // Thực hiện các thao tác xóa sản phẩm tại đây với id
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
