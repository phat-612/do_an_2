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
document
  .querySelector("#new-product-form button")
  .addEventListener("click", function (evt) {
    evt.preventDefault();

    // Lấy dữ liệu từ form
    var formData = new FormData(document.querySelector("#new-product-form"));

    // Chuyển dữ liệu form thành JSON
    var formJson = JSON.stringify(Object.fromEntries(formData));

    // Gửi dữ liệu đến server
    fetch("/path/to/your/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: formJson,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "Success") {
          alert("Sản phẩm đã được tạo thành công.");
        } else {
          alert("Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      });
  });
s;
