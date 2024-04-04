$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var id = $(this).data("id");
    var result = confirm("Bạn có chắc chắn muốn xóa không?");

    if (result) {
      // Thực hiện các thao tác xóa sản phẩm tại đây với id
      $.ajax({
        url: "/amin/warranty/" + id + "/delete",
        type: "GET",
        success: function (response) {
          console.log("Xóa bảo hành thành công.");
          // Thực hiện các thao tác sau khi xóa thành công
        },
        error: function (xhr, status, error) {
          console.log("Lỗi xóa bảo hành: " + error);
          // Thực hiện các thao tác khi xóa không thành công
        },
      });
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
