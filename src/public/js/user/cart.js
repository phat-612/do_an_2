$(document).ready(function () {
  updateSummary();
  $(".btnMinus").click((e) => {
    const button = e.target;
    const idVariation = button.getAttribute("data-bs-idVariation");
    const storageQuantity = button.getAttribute("data-bs-storageQuantity");
    const cartQuantity = button.getAttribute("data-bs-cartQuantity");
    const price = button.getAttribute("data-bs-price");
    const tempQuantity = parseInt(cartQuantity) - 1;
    if (tempQuantity <= 0) {
      deleteItem(button);
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
    const row = $(input.closest("tr"));
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
  function updateSummary() {
    const totalItem = $(".totalItem");
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
        const row = $(element.closest("tr"));
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
        const row = $(button.closest("tr"));
        row.remove();
        updateSummary();
      } else {
        alert("Có lỗi xảy ra");
      }
    });
  }
});
