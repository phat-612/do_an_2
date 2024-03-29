var details = [];

var addProductButton = document.getElementById("addProduct");
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
    var productData = {
      idProduct: selectedProductId,
      reasonAndPrice: [],
    };

    var productContainer = document.createElement("div");
    productContainer.className = "product-container";
    productContainer.id = "product-container[" + productCounter + "]";
    productCounter++;

    var addInputGroup = document.createElement("div");
    addInputGroup.className = "input-group mb-3";

    var productNameInput = document.createElement("input");
    productNameInput.className = "form-control";
    productNameInput.type = "text";
    productNameInput.value = selectedOption;
    productNameInput.disabled = true;

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
      var newReasonInput = document.createElement("input");
      newReasonInput.className = "form-control";
      newReasonInput.type = "text";
      newReasonInput.placeholder = "Lý do";

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";

      var newDeleteButton = document.createElement("button");
      newDeleteButton.className = "btn btn-outline-secondary delete-button";
      newDeleteButton.type = "button";
      newDeleteButton.innerText = "Xóa";

      newDeleteButton.addEventListener("click", function () {
        var reasonAndPriceIndex = productData.reasonAndPrice.findIndex(
          function (item) {
            return (
              item.reason === newReasonInput.value &&
              item.price === newPriceInput.value
            );
          }
        );

        if (reasonAndPriceIndex !== -1) {
          productData.reasonAndPrice.splice(reasonAndPriceIndex, 1);
          newInputGroup.remove();
        }
      });

      newDeleteButton.addEventListener("click", function () {
        var reasonAndPriceIndex =
          productData.reasonAndPrice.indexOf(reasonAndPrice);
        productData.reasonAndPrice.splice(reasonAndPriceIndex, 1);
        newInputGroup.remove();
      });

      var reasonAndPrice = {
        reason: newReasonInput.value,
        price: newPriceInput.value,
      };
      productData.reasonAndPrice.push(reasonAndPrice);

      newInputGroup.appendChild(newReasonInput);
      newInputGroup.appendChild(newPriceInput);
      newInputGroup.appendChild(newDeleteButton);

      addInputGroup.appendChild(newInputGroup);
    });

    addInputGroup.appendChild(productNameInput);
    addInputGroup.appendChild(deleteButton);
    addInputGroup.appendChild(addButton);

    productContainer.appendChild(addInputGroup);
    addInput.appendChild(productContainer);

    details.push(productData);

    inputSanPham.value = "";
  }
});
