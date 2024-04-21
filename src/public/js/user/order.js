$(document).ready(function () {
  $(".chosePaymentMethod").click((event) => {
    let button = $(event.target);
    let paymentMethod = button.attr("data-bs-method");
    if (paymentMethod == 1) {
      $(".btnSubmit").text("Thanh toán");
    } else {
      $(".btnSubmit").text("Đặt hàng");
    }
    button.addClass("border border-danger");
    button.siblings().removeClass("border border-danger");
  });
});
