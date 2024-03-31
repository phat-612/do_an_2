var inputSanPham = document.getElementById("detail");
var addInput = document.getElementById("addInput");
var addProductButton = document.getElementById("addProduct");
var productCounter = 0;
var priceCounter = 0;
var data = {
  details: [],
};

addProductButton.addEventListener("click", function () {
  var selectedOption = inputSanPham.value;
  var selectedProductId = "";

  var options = document
    .getElementById("datalistOptions")
    .getElementsByTagName("option");

  for (var i = 0; i < options.length; i++) {
    if (options[i].innerText === selectedOption) {
      selectedProductId = options[i].id;
      break;
    }
  }

  if (selectedOption !== "" && selectedProductId !== "") {
    var productContainer = document.createElement("div");
    productContainer.className = "product-container";
    productContainer.id = "product-container[" + productCounter + "]";
    productContainer.setAttribute("data-reason-counter", "0");
    var addInputGroup = document.createElement("div");
    addInputGroup.className = "input-group mb-3";

    var productNameInput = document.createElement("input");
    productNameInput.className = "form-control";
    productNameInput.type = "text";
    productNameInput.value = selectedOption;
    productNameInput.disabled = true;
    productNameInput.name = "detail[" + productCounter + "]";

    var productIdInput = document.createElement("input");
    productIdInput.type = "hidden";
    productIdInput.value = selectedProductId;
    productIdInput.name = "detail[]";

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-secondary delete-button";
    deleteButton.type = "button";
    deleteButton.innerText = "Xóa";

    deleteButton.addEventListener("click", function () {
      productContainer.remove();
    });

    var addButton = document.createElement("button");
    addButton.className = "btn btn-outline-secondary";
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
      newReasonInput.name = `details[${productCounter}][reasonAndPrice][]`;

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.name = `[${reasonCounter}][price]`;

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
      priceCounter++;
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
        (item) => item.productId === selectedProductId
      );
      if (productIndex !== -1) {
        // Sản phẩm đã tồn tại trong biến data, chỉ cần thêm lý do và giá mới
        data.details[productIndex].reasonAndPrice.push(productData);
      } else {
        // Sản phẩm chưa tồn tại trong biến data, thêm sản phẩm mới
        data.details.push({
          productId: selectedProductId,
          reasonAndPrice: [productData],
        });
      }

      // Chuyển đổi thành JSON và hiển thị trong console
      var jsonData = JSON.stringify(data);
      console.log(jsonData);
    });

    addInputGroup.appendChild(productNameInput);
    addInputGroup.appendChild(productIdInput);
    addInputGroup.appendChild(deleteButton);
    addInputGroup.appendChild(addButton);

    productContainer.appendChild(addInputGroup);
    addInput.appendChild(productContainer);

    inputSanPham.value = "";
    productCounter++;
  }
});
