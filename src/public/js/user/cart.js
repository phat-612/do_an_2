$(document).ready(function () {
  updateSummary();
  $(".btnMinus").click((e) => {
    const button = e.target;
    const row = $(button.closest(".row"));
    const idVariation = button.getAttribute("data-bs-idVariation");
    const storageQuantity = button.getAttribute("data-bs-storageQuantity");
    const cartQuantity = button.getAttribute("data-bs-cartQuantity");
    const price = button.getAttribute("data-bs-price");
    const tempQuantity = parseInt(cartQuantity) - 1;
    if (tempQuantity <= 0) {
      const btnDelete = $(row.find(".btnDelete"));
      if (!deleteItem(btnDelete)) {
        input.value = cartQuantity;
      }
      return;
    }
    // api trừ
    updateCartQuantity("decrease", idVariation, tempQuantity, price, button);
  });
  $(".btnPlus").click((e) => {
    const button = e.target;
    const idVariation = button.getAttribute("data-bs-idVariation");
    const storageQuantity = button.getAttribute("data-bs-storageQuantity");
    const cartQuantity = button.getAttribute("data-bs-cartQuantity");
    const price = button.getAttribute("data-bs-price");
    const tempQuantity = parseInt(cartQuantity) + 1;
    if (tempQuantity > storageQuantity) {
      alert("Số lượng sản phẩm trong kho không đủ");
      return;
    }
    // api cộng
    updateCartQuantity("increase", idVariation, tempQuantity, price, button);
  });
  $(".btnDelete").click((e) => {
    const button = $(e.target);
    deleteItem(button);
  });
  $(".inpQuantity").change((e) => {
    const input = e.target;
    const row = $(input.closest(".row"));
    const idVariation = row.find(".btnMinus").attr("data-bs-idVariation");
    const storageQuantity = row
      .find(".btnMinus")
      .attr("data-bs-storageQuantity");
    const cartQuantity = row.find(".btnMinus").attr("data-bs-cartQuantity");
    const price = row.find(".btnMinus").attr("data-bs-price");
    if (isNaN(input.value)) {
      alert("Vui lòng nhập số");
      input.value = cartQuantity;
      return;
    }
    let tempQuantity = parseInt(input.value);
    if (tempQuantity <= 0) {
      const btnDelete = $(row.find(".btnDelete"));
      if (!deleteItem(btnDelete)) {
        input.value = cartQuantity;
      }
      return;
    }
    if (tempQuantity > storageQuantity) {
      alert("Số lượng sản phẩm trong kho không đủ");
      tempQuantity = storageQuantity;
      $(row.find(".btnMinus")).attr("data-bs-cartQuantity", tempQuantity);
      $(row.find(".btnPlus")).attr("data-bs-cartQuantity", tempQuantity);
      input.value = storageQuantity;
      return;
    }
    // api update
    updateCartQuantity("update", idVariation, tempQuantity, price, input);
  });
  // xử lý checkbox
  $(".checkAll").change((e) => {
    const isChecked = e.target.checked;
    $(".checkItem").each((index, item) => {
      if ($(item).is(":disabled")) return;
      item.checked = isChecked;
      const row = $(item.closest(".row"));
      if (isChecked) {
        row.find(".totalItem").addClass("isCheck");
      } else {
        row.find(".totalItem").removeClass("isCheck");
      }
    });
    updateSummary();
  });
  $(".checkItem").change((e) => {
    console.log("change");
    const isChecked = $(".checkItem:checked:not(:disabled)").length;
    const totalCheck = $(".checkItem:not(:disabled)").length;
    $(".checkAll").prop("checked", isChecked === totalCheck);
    const row = $(e.target.closest(".row"));
    if (e.target.checked) {
      row.find(".totalItem").addClass("isCheck");
    } else {
      row.find(".totalItem").removeClass("isCheck");
    }
    updateSummary();
  });
  // hàm xử lý
  function updateSummary() {
    const totalItem = $(".totalItem.isCheck");

    const total = totalItem.toArray().reduce((acc, cur) => {
      return acc + parseInt(cur.innerText.replaceAll(".", ""));
    }, 0);
    $(".totalItems").text(total.toLocaleString("vi-VN"));
    $(".totalPayment").text(total.toLocaleString("vi-VN"));
  }
  function updateCartQuantity(
    action,
    idVariation,
    tempQuantity,
    price,
    element
  ) {
    fetch("/api/cart?_method=PUT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idVariation: idVariation,
        quantity: tempQuantity,
        action,
      }),
    }).then((res) => {
      if (res.ok) {
        const row = $(element.closest(".row"));
        $(row.find(".btnMinus")).attr("data-bs-cartQuantity", tempQuantity);
        $(row.find(".btnPlus")).attr("data-bs-cartQuantity", tempQuantity);
        $(row.find("input")).val(tempQuantity);
        $(row.find(".totalItem")).text(
          (tempQuantity * price).toLocaleString("vi-VN")
        );
        updateSummary();
      } else {
        alert("Có lỗi xảy ra");
      }
    });
  }
  function deleteItem(button) {
    const idVariation = button.attr("data-bs-idVariation");
    let isDelete = confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?");
    if (!isDelete) return false;
    fetch("/api/cart?_method=DELETE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idVariation: idVariation,
      }),
    }).then((res) => {
      if (res.ok) {
        const row = $(button.closest(".row"));
        row.remove();
        updateSummary();
      } else {
        alert("Có lỗi xảy ra");
      }
    });
  }
  $(".btnOrder").click((e) => {
    e.preventDefault();
    let output = [];
    const rows = $(".showProduct .row");
    rows.toArray().forEach((row) => {
      const isCheck = $(row).find(".checkItem").prop("checked");
      if (!isCheck) return;
      const idVariation = $(row).find(".btnMinus").attr("data-bs-idVariation");
      const quantity = $(row).find(".inpQauntity").val();
      output.push({ idVariation, quantity });
    });
    if (output.length === 0) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }
    document.cookie = `cart=${JSON.stringify(output)}`;
    window.location.href = "/me/order";
  });
});
