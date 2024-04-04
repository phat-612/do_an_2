$(document).ready(function () {
  $(".deleteWarranty").on("click", function (event) {
    event.preventDefault();
    var result = confirm("Bạn có chắc chắn muốn xóa không?");
    if (result) {
      // console.log("Đã xóa sản phẩm.");
      var btnDeleteWarranty = document.getElementById("deleteWarranty");
      btnDeleteWarranty.onclick = function () {
        console.log("btnDeleteWarranty");
        // Thực hiện các thao tác xóa sản phẩm tại đây
      };
    } else {
      console.log("Đã hủy xóa sản phẩm.");
    }
  });
});
