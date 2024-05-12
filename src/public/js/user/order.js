$(document).ready(function () {
  $(".chosePaymentMethod").click((event) => {
    let button = $(event.target);
    let paymentMethod = button.attr("data-bs-method");
    if (paymentMethod == 1) {
      $(".btnSubmit").text("Thanh toán");
      $("#paymentMethod").val("online");
    } else {
      $(".btnSubmit").text("Đặt hàng");
      $("#paymentMethod").val("cod");
    }
    button.addClass("border border-danger");
    button.siblings().removeClass("border border-danger");
  });
  // handle default address
  $("input[name=listAddress]").change((event) => {
    const radioBtn = $(event.target);
    const name = radioBtn.attr("data-bs-name");
    const phone = radioBtn.attr("data-bs-phone");
    const address = radioBtn.attr("data-bs-address");
    $("input[name=shipmentDetail\\[name\\]]").val(name);
    $("input[name=shipmentDetail\\[phone\\]]").val(phone);
    $("input[name=shipmentDetail\\[address\\]]").val(address);
  });
  $("input[name=listAddress]").each((index, radioBtn) => {
    if ($(radioBtn).is(":checked")) {
      const name = $(radioBtn).attr("data-bs-name");
      const phone = $(radioBtn).attr("data-bs-phone");
      const address = $(radioBtn).attr("data-bs-address");
      $("input[name=shipmentDetail\\[name\\]]").val(name);
      $("input[name=shipmentDetail\\[phone\\]]").val(phone);
      $("input[name=shipmentDetail\\[address\\]]").val(address);
    }
  });
  // handle add new address
  $("#btnAddAddress").click((event) => {
    $("input[name=shipmentDetail\\[name\\]]").val("");
    $("input[name=shipmentDetail\\[phone\\]]").val("");
    $("input[name=shipmentDetail\\[address\\]]").val("");
    $("input[name=listAddress]").prop("checked", false);
    $("#addAddress").removeClass("d-none");
  });
});
