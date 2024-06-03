document.addEventListener("DOMContentLoaded", function () {
  // function removeProduct(id) {
  //   var product = document.getElementById(id);
  //   product.parentNode.removeChild(product);
  // }

  let addButtons = document.querySelectorAll(".addButton");
  // let deleteButtons = document.querySelectorAll(".deleteButton");
  let tempProduct = $(".areaDetailProducts>div").length;

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
  // xóa chi tiết và giá sản phẩm có sẵn
  document.querySelectorAll(".deleteButton").forEach(function (button) {
    button.addEventListener("click", function () {
      const productContainer = this.closest(".productContainer");

      const inputLis = Array.from(
        productContainer.querySelectorAll("li")
      ).filter((li) =>
        li.querySelector("input[type='text'], input[type='number']")
      );

      if (inputLis.length > 1) {
        inputLis[inputLis.length - 1].remove();
      } else {
        alert("Không thể xóa: Cần ít nhất 1 ô nhập liệu.");
      }
    });
  });

  // var inputSanPham = document.getElementById("detail");
  var addInput = document.getElementById("addInput");
  var addProductButton = document.getElementById("addProduct");
  var productCounter = 0;

  addProductButton.addEventListener("click", function () {
    var inputSanPham = document.getElementById("detail");

    var selectedOption = inputSanPham.value;
    var selectedProductId = "";

    var options = document
      .getElementById("datalistOptions")
      .getElementsByTagName("option");

    if (!options || options.length === 0) {
      alert("Hãy chọn ít nhất một lựa chọn!");
      return;
    }

    var isOptionSelected = false;

    for (var i = 0; i < options.length; i++) {
      if (options[i].innerText === selectedOption) {
        selectedProductId = options[i].id;
        isOptionSelected = true;
        break;
      }
    }

    if (!isOptionSelected) {
      alert("Hãy chọn ít nhất một lựa chọn!");
      return;
    }
    if (selectedOption !== "" && selectedProductId !== "") {
      inputSanPham.required = false;
      var productContainer = document.createElement("div");
      productContainer.className = "product-container";
      productContainer.id = "product-container[" + productCounter + "]";
      productContainer.setAttribute("data-reason-counter", "0");
      productContainer.setAttribute("data-add-clicked", "false");
      productContainer.setAttribute("data-product-counter", productCounter);

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
      productIdInput.name = `details[${
        productCounter + tempProduct
      }][idProduct]`;

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
        var currentProductContainer = this.closest(".product-container");
        var reasonCounter = parseInt(
          currentProductContainer.getAttribute("data-reason-counter")
        );

        var newInputGroup = document.createElement("div");
        newInputGroup.className = "input-group mb-3 newInputGroup";

        var newReasonInput = document.createElement("input");
        newReasonInput.className = "form-control";
        newReasonInput.type = "text";
        newReasonInput.placeholder = "Lý do";
        newReasonInput.name = `details[${
          parseInt(
            currentProductContainer.getAttribute("data-product-counter")
          ) + tempProduct
        }][reasonAndPrice][${reasonCounter}][reason]`;
        newReasonInput.required = true;

        var newPriceInput = document.createElement("input");
        newPriceInput.className = "form-control";
        newPriceInput.type = "number";
        newPriceInput.placeholder = "Giá";
        newPriceInput.name = `details[${
          parseInt(
            currentProductContainer.getAttribute("data-product-counter")
          ) + tempProduct
        }][reasonAndPrice][${reasonCounter}][price]`;
        newPriceInput.required = true;

        var newDeleteButton = document.createElement("button");
        newDeleteButton.className = "btn btn-outline-secondary delete-button";
        newDeleteButton.type = "button";
        newDeleteButton.innerText = "Xóa";

        newDeleteButton.addEventListener("click", function () {
          newInputGroup.remove();
          var newInputGroups =
            currentProductContainer.getElementsByClassName("newInputGroup");
          if (newInputGroups.length === 0) {
            currentProductContainer.setAttribute("data-add-clicked", "false");
          }
          currentProductContainer.setAttribute(
            "data-reason-counter",
            newInputGroups.length.toString()
          );
        });

        newInputGroup.appendChild(newReasonInput);
        newInputGroup.appendChild(newPriceInput);
        newInputGroup.appendChild(newDeleteButton);

        var addInputGroup =
          currentProductContainer.getElementsByClassName("input-group mb-3")[0];
        addInputGroup.appendChild(newInputGroup);

        reasonCounter++;
        currentProductContainer.setAttribute(
          "data-reason-counter",
          reasonCounter.toString()
        );

        currentProductContainer.setAttribute("data-add-clicked", "true");
        inputSanPham.required = false;
      });

      addInputGroup.appendChild(productNameInput);
      addInputGroup.appendChild(productIdInput);
      addInputGroup.appendChild(deleteButton);
      addInputGroup.appendChild(addButton);

      productContainer.appendChild(addInputGroup);
      addInput.appendChild(productContainer);

      inputSanPham.value = "";
      productCounter++;
      inputSanPham.required = false;
    }
  });
  document.getElementById("form").addEventListener("submit", function (event) {
    const productContainers = Array.from(
      document.getElementsByClassName("product-container")
    );

    productContainers.forEach((productContainer, i) => {
      const reasonsProvided = Array.from(
        productContainer.querySelectorAll('input[type="text"]')
      ).some((input) => input.value);
      const pricesProvided = Array.from(
        productContainer.querySelectorAll('input[type="number"]')
      ).some((input) => input.value);

      if (!reasonsProvided || !pricesProvided) {
        alert(`Hãy nhập ít nhất một lý do và giá trị cho sản phẩm ${i + 1}.`);
        event.preventDefault();
      }
    });
  });
  document.querySelectorAll(".deleteButtonProduct").forEach(function (button) {
    button.addEventListener("click", function () {
      const allProductContainers =
        document.querySelectorAll(".productContainer");
      if (allProductContainers.length <= 1) {
        alert("Không thể xóa: Cần ít nhất 1 sản phẩm.");
      } else {
        const productContainer = this.closest(".productContainer");
        if (productContainer) {
          productContainer.remove();
        } else {
          alert("Không tìm thấy sản phẩm để xóa.");
        }
      }
    });
  });
});
