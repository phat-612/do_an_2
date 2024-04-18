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
// Lắng nghe sự kiện click trên nút 'Tạo'
document
  .querySelector("#new-product-form button")
  .addEventListener("click", function (evt) {
    // Ngăn chặn hành vi mặc định của form
    evt.preventDefault();

    // Lấy tất cả các giá trị từ form
    var formData = new FormData(document.querySelector("#new-product-form"));

    // Chuyển dữ liệu form thành object
    var formObject = {};
    formData.forEach((value, key) => {
      // hàm này sẽ gán túi từng giá trị đến từng key tương ứng
      formObject[key] = value;
    });

    // Chuyển đổi object thành JSON
    var formJson = JSON.stringify(formObject);

    // Gửi dữ liệu đến server
    fetch("/api/storeWarranty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: formJson,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.status === "Success") {
          alert("Sản phẩm đã được tạo thành công.");
        } else {
          alert("Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  });
