var inputSanPham = document.getElementById("detail");
var addInput = document.getElementById("addInput");
var addProductButton = document.getElementById("addProduct");
var productCounter = 0;

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
      selectedProductId = options[i].getAttribute("data-product-id");
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
    productNameInput.name = "detail[" + productCounter + "][productName]";

    var productIdInput = document.createElement("input");
    productIdInput.type = "hidden";
    productIdInput.value = selectedProductId;
    productIdInput.name = "detail[" + productCounter + "][productId]";

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
      newReasonInput.name = `detail[${productCounter}][reason][${reasonCounter}]`;

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.name = `detail[${productCounter}][price][${reasonCounter}]`;

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
      var productIndex = data.details.findIndex(function (item) {
        return item.productId === selectedProductId;
      });

      var reasonAndPrice = {
        reason: newReasonInput.value,
        price: newPriceInput.value,
      };

      if (productIndex !== -1) {
        // Sản phẩm đã tồn tại trong biến data, chỉ cần thêm lý do và giá mới
        data.details[productIndex].detail.push(reasonAndPrice);
      } else {
        // Sản phẩm chưa tồn tại trong biến data, thêm sản phẩm mới
        var newProduct = {
          productId: selectedProductId,
          detail: [reasonAndPrice],
        };
        data.details.push(newProduct);
      }

      // Chuyển đổi thành JSON và hiển thị trong console
      var jsonData = JSON.stringify(data);
      console.log(jsonData);

      // Reset giá trị của input
      newReasonInput.value = "";
      newPriceInput.value = "";
    });

    addInputGroup.appendChild(productNameInput);
    addInputGroup.appendChild(productIdInput);
    addInputGroup.appendChild(deleteButton);
    addInputGroup.appendChild(addButton);

    productContainer.appendChild(addInputGroup);

    addInput.appendChild(productContainer);

    productCounter++;
  }
});
