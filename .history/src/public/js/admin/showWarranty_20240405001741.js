$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var result = confirm("Bạn có chắc chắn muốn xóa không?");
    if (result) {
      var button = $(event.relatedTarget);
      var id = button.data("id");
      console.log(id);
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
