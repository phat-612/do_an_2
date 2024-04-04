$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var result = confirm("Bạn có chắc chắn muốn xóa không?");
    if (result) {
      var button = $(this);
      var id = button.data("id");
      $.ajax({
        url: "/amin/warranty/" + id + "/delete",
        type: "DELETE",
        success: function (result) {
          window.location.reload();
        },
      });
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
