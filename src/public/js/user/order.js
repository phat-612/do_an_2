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
    button.addClass("border border-2 border-danger");
    button.removeClass("border-0");
    button.siblings().addClass("border-0");
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
  // handle submit form
  $("#formOrder").submit((event) => {
    event.preventDefault();
    let isValidate = true;
    const inpShipmentDetail = [
      "shipmentDetail[name]",
      "shipmentDetail[phone]",
      "shipmentDetail[address]",
    ];
    let isErrorShipping = false;
    $("input.required").each(function (ind, ele) {
      if ($(ele).val() == "") {
        isValidate = false;
        if (
          inpShipmentDetail.includes($(ele).attr("name")) ||
          isErrorShipping
        ) {
          isErrorShipping = true;
          $(".error-shipping").removeClass("d-none");
        } else {
          $(".error-shipping").addClass("d-none");
        }
        if ($(ele).attr("name") == "paymentMethod") {
          $(".error-payment-method").removeClass("d-none");
        } else {
          $(".error-payment-method").addClass("d-none");
        }
      }
    });
    if (!isValidate) {
      return;
    }
    event.target.submit();
  });
  // handle note character count
  $("textarea[name=note]").keyup((event) => {
    const note = $("textarea[name=note]").val();
    const count = note.length;
    if (count > 200) {
      $("textarea[name=note]").val(note.substring(0, 200));
      return;
    }
    $("#countNote").text(count);
  });
});
