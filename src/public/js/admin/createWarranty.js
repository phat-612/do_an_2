var inputSanPham = document.getElementById("idProduct");
var addInput = document.getElementById("addInput");

inputSanPham.addEventListener("change", function () {
  var selectedProduct = inputSanPham.value;
  if (selectedProduct !== "") {
    var addInputGroup = document.createElement("div");
    addInputGroup.className = "input-group";

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-secondary";
    deleteButton.type = "button";
    deleteButton.innerText = "Xóa";
    deleteButton.addEventListener("click", function () {
      addInputGroup.remove();
    });

    var productName = document.createElement("p");
    productName.innerText = selectedProduct;
    addInputGroup.appendChild(productName);

    var reasonInput = document.createElement("input");
    reasonInput.className = "form-control";
    reasonInput.type = "text";
    reasonInput.placeholder = "Lý do";
    addInputGroup.appendChild(reasonInput);

    var priceInput = document.createElement("input");
    priceInput.className = "form-control";
    priceInput.type = "text";
    priceInput.placeholder = "Giá";
    addInputGroup.appendChild(priceInput);

    var addButton = document.createElement("button");
    addButton.className = "btn btn-outline-secondary";
    addButton.type = "button";
    addButton.innerText = "Cộng";
    addButton.addEventListener("click", function () {
      var currentReason = reasonInput.value;
      var currentPrice = priceInput.value;
      var parsedPrice = parseFloat(currentPrice);
      if (!isNaN(parsedPrice)) {
        parsedPrice += 1;
        priceInput.value = parsedPrice;
      }
      reasonInput.value = currentReason;

      // Thêm ô nhập lý do và giá
      var newInputGroup = document.createElement("div");
      newInputGroup.className = "input-group";
      var newDeleteButton = document.createElement("button");
      newDeleteButton.className = "btn btn-outline-secondary";
      newDeleteButton.type = "button";
      newDeleteButton.innerText = "Xóa";
      newDeleteButton.addEventListener("click", function () {
        newInputGroup.remove();
      });

      var newReasonInput = document.createElement("input");
      newReasonInput.className = "form-control";
      newReasonInput.type = "text";
      newReasonInput.placeholder = "Lý do";
      newReasonInput.addEventListener("input", function () {
        var newCurrentReason = newReasonInput.value;
        var newCurrentPrice = newPriceInput.value;
        var newParsedPrice = parseFloat(newCurrentPrice);
        if (!isNaN(newParsedPrice)) {
          newParsedPrice += 1;
          newPriceInput.value = newParsedPrice;
        }
        newReasonInput.value = newCurrentReason;
      });

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.addEventListener("input", function () {
        var newCurrentReason = newReasonInput.value;
        var newCurrentPrice = newPriceInput.value;
        var newParsedPrice = parseFloat(newCurrentPrice);
        if (!isNaN(newParsedPrice)) {
          newParsedPrice += 1;
          newPriceInput.value = newParsedPrice;
        }
        newReasonInput.value = newCurrentReason;
      });

      newInputGroup.appendChild(newReasonInput);
      newInputGroup.appendChild(newPriceInput);
      newInputGroup.appendChild(newDeleteButton);

      addInput.appendChild(newInputGroup);
    });

    addInputGroup.appendChild(addButton);
    addInputGroup.appendChild(deleteButton);
    addInput.appendChild(addInputGroup);

    inputSanPham.value = "";
  }
});
