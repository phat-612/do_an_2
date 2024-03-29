var addProductButton = document.getElementById("addProductButton");
var detailInput = document.getElementById("detail");
var datalistOptions = document.getElementById("datalistOptions");
var addInputGroup = document.getElementById("addInputGroup");
var productCounter = 0;
var data = {
  details: [],
};

// Gắn sự kiện "click" cho nút "Thêm sản phẩm"
addProductButton.addEventListener("click", function () {
  var detailValue = detailInput.value;
  var selectedOption = datalistOptions.querySelector(
    "option[value='" + detailValue + "']"
  );
  if (selectedOption) {
    var selectedProductId = selectedOption.id;

    var productContainer = document.createElement("div");
    productContainer.id = "productContainer" + productCounter;

    var productNameInput = document.createElement("input");
    productNameInput.className = "form-control";
    productNameInput.type = "text";
    productNameInput.value = detailValue;
    productNameInput.disabled = true;

    var productIdInput = document.createElement("input");
    productIdInput.type = "hidden";
    productIdInput.name = "details[" + productCounter + "][idProduct]";
    productIdInput.value = selectedProductId;

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-danger delete-button";
    deleteButton.type = "button";
    deleteButton.innerText = "Xóa";

    deleteButton.addEventListener("click", function () {
      productContainer.remove();
    });

    var addButton = document.createElement("button");
    addButton.className = "btn btn-outline-success add-button";
    addButton.type = "button";
    addButton.innerText = "Cộng";

    addButton.addEventListener("click", function () {
      var reasonCounter = parseInt(
        productContainer.getAttribute("data-reason-counter")
      );

      var newInputGroup = document.createElement("div");
      newInputGroup.className = "input-group mb-3";

      var newReasonInput = document.createElement("input");
      newReasonInput.className = "form-control";
      newReasonInput.type = "text";
      newReasonInput.placeholder = "Lý do";
      newReasonInput.name =
        "details[" +
        productCounter +
        "][reasonAndPrice][" +
        reasonCounter +
        "][reason]";

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.name =
        "details[" +
        productCounter +
        "][reasonAndPrice][" +
        reasonCounter +
        "][price]";

      var newDeleteButton = document.createElement("button");
      newDeleteButton.className = "btn btn-outline-secondary delete-button";
      newDeleteButton.type = "button";
      newDeleteButton.innerText = "Xóa";

      newDeleteButton.addEventListener("click", function () {
        newInputGroup.remove();
      });

      newInputGroup.appendChild(newReasonInput);
      newInputGroup.appendChild(newPriceInput);
      newInputGroup.appendChild(newDeleteButton);

      addInputGroup.appendChild(newInputGroup);

      reasonCounter++;
      productContainer.setAttribute(
        "data-reason-counter",
        reasonCounter.toString()
      );

      // Lưu dữ liệu vào biến data
      var productData = {
        reason: newReasonInput.value,
        price: newPriceInput.value,
      };

      // Kiểm tra và thêm dữ liệu vào biến data
      var productIndex = data.details.findIndex(
        (item) => item.idProduct === selectedProductId
      );
      if (productIndex !== -1) {
        // Sản phẩm đã tồn tại trong biến data, chỉ cần thêm lý do và giá mới
        data.details[productIndex].reasonAndPrice.push(productData);
      } else {
        // Sản phẩm chưa tồn tại trong biến data, thêm sản phẩm mới
        data.details.push({
          idProduct: selectedProductId,
          reasonAndPrice: [productData],
        });
      }
    });

    productContainer.appendChild(productNameInput);
    productContainer.appendChild(productIdInput);
    productContainer.appendChild(deleteButton);
    productContainer.appendChild(addButton);

    addInputGroup.appendChild(productContainer);

    productCounter++;
  }

  detailInput.value = "";
});
