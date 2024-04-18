let addButtons = document.querySelectorAll(".addButton");
let deleteButtons = document.querySelectorAll(".deleteButton");

addButtons.forEach((addButton, outerIndex) => {
  addButton.addEventListener("click", function (e) {
    let listItemContainer = e.target.parentElement.parentElement;
    let listItemsCount = listItemContainer.querySelectorAll("li").length - 1;

    let newLi = document.createElement("li");

    let newReasonInput = document.createElement("input");
    let newPriceInput = document.createElement("input");

    newReasonInput.type = "text";
    newReasonInput.name = `details[${outerIndex}][reasonAndPrice][${listItemsCount}][reason]`;
    newReasonInput.id = `reason-${outerIndex}-${listItemsCount}`;
    newReasonInput.required = true;

    newPriceInput.type = "number";
    newPriceInput.name = `details[${outerIndex}][reasonAndPrice][${listItemsCount}][price]`;
    newPriceInput.id = `price-${outerIndex}-${listItemsCount}`;
    newPriceInput.required = true;

    newLi.appendChild(newReasonInput);
    newLi.appendChild(newPriceInput);

    listItemContainer.insertBefore(newLi, addButton.parentElement);
  });
});

deleteButtons.forEach((deleteButton) => {
  deleteButton.addEventListener("click", function (e) {
    let listItemContainer = e.target.parentElement.parentElement;
    let listItems = listItemContainer.querySelectorAll("li");
    if (listItems.length > 2) {
      listItems[listItems.length - 2].remove(); // xóa li cuối cùng trước nút "Thêm"
    }
  });
});

// ===============================================================
// document
//   .getElementById("addProductButton")
//   .addEventListener("click", function () {
//     const productName = document.getElementById("newProductName").value;
//     const reason = document.getElementById("reason-0-0").value;
//     const price = document.getElementById("price-0-0").value;

//     // Xử lý logic tương ứng ở đây.
//     // Ví dụ: bạn có thể gọi fetch API để tạo ra một sản phẩm mới với thông tin đã thu thập được.

//     fetch("/api/storeWarranty", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         idProduct: productName,
//         reasonAndPrice: {
//           reason: reason,
//           price: price,
//         },
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         // Thêm xử lý sau khi gọi API thành công ở đây.
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   });
