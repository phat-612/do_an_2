var inputSanPham = document.getElementById("detail");
var addInput = document.getElementById("addInput");
var addProductButton = document.getElementById("addProduct");
var productCounter = 0;

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

    var productIdInput = document.createElement("input");
    productIdInput.type = "hidden";
    productIdInput.value = selectedProductId;
    productIdInput.name = `details[${productCounter}][idProduct]`;

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-secondary delete-button";
    deleteButton.type = "button";
    deleteButton.innerText = "Xóa";

    deleteButton.addEventListener("click", function () {
      productContainer.remove();
      inputSanPham.required = true; // Thêm lại thuộc tính required cho ô input
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
      newInputGroup.className = "input-group mb-3 newInputGroup";

      var newReasonInput = document.createElement("input");
      newReasonInput.className = "form-control";
      newReasonInput.type = "text";
      newReasonInput.placeholder = "Lý do";
      newReasonInput.name = `details[${productCounter}][reasonAndPrice][${reasonCounter}][reason]`;
      newReasonInput.required = true;

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.name = `details[${productCounter}][reasonAndPrice][${reasonCounter}][price]`;
      newPriceInput.required = true;

      var newDeleteButton = document.createElement("button");
      newDeleteButton.className = "btn btn-outline-secondary delete-button";
      newDeleteButton.type = "button";
      newDeleteButton.innerText = "Xóa";

      newDeleteButton.addEventListener("click", function () {
        newInputGroup.remove();
        var newInputGroups =
          productContainer.getElementsByClassName("newInputGroup");
        if (newInputGroups.length === 0) {
          // Nếu không còn nhóm input nào, hãy cập nhật cờ "data-add-clicked"
          productContainer.setAttribute("data-add-clicked", "false");
        }
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

      // Đánh dấu đã thêm mới INPUT cho sản phẩm này
      productContainer.setAttribute("data-add-clicked", "true");
      inputSanPham.required = false; // Xóa thuộc tính required của ô input
    });

    addInputGroup.appendChild(productNameInput);
    addInputGroup.appendChild(productIdInput);
    addInputGroup.appendChild(deleteButton);
    addInputGroup.appendChild(addButton);

    productContainer.appendChild(addInputGroup);
    addInput.appendChild(productContainer);

    inputSanPham.value = "";
    productCounter++;
    inputSanPham.required = true; // Thêm lại thuộc tính required cho ô input
  } else {
    alert("Vui lòng chọn một sản phẩm để tiếp tục!");
  }
});

// ...
