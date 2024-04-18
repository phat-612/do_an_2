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
let createProductButton = document.querySelector(".btn-primary");

createProductButton.addEventListener("click", function (e) {
  let productDetailsContainer = document.querySelector(".product-details");
  let productCount = productDetailsContainer.querySelectorAll(".col-12").length;

  let newProductDiv = document.createElement("div");
  newProductDiv.classList.add("col-12");

  let productNameLabel = document.createElement("strong");
  productNameLabel.textContent = "Tên sản phẩm:";

  let productNameSelect = document.createElement("select");
  productNameSelect.name = `details[${productCount}][idProduct]`;

  let defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "---Không chọn sản phẩm---";
  productNameSelect.appendChild(defaultOption);

  let products = document.querySelectorAll("#newProductName option");
  products.forEach((product) => {
    let option = document.createElement("option");
    option.value = product.value;
    option.textContent = product.textContent;
    productNameSelect.appendChild(option);
  });

  let reasonsAndPricesDiv = document.createElement("div");

  let reasonsAndPricesLabel = document.createElement("strong");
  reasonsAndPricesLabel.textContent = "Lý do bảo hành:";

  let ul = document.createElement("ul");

  let li = document.createElement("li");

  let reasonInput = document.createElement("input");
  reasonInput.type = "text";
  reasonInput.placeholder = "Lý do";
  reasonInput.name = `details[${productCount}][reasonAndPrice][0][reason]`;

  let priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.placeholder = "Giá";
  priceInput.name = `details[${productCount}][reasonAndPrice][0][price]`;

  li.appendChild(reasonInput);
  li.appendChild(priceInput);
  ul.appendChild(li);

  reasonsAndPricesDiv.appendChild(reasonsAndPricesLabel);
  reasonsAndPricesDiv.appendChild(ul);

  newProductDiv.appendChild(productNameLabel);
  newProductDiv.appendChild(productNameSelect);
  newProductDiv.appendChild(reasonsAndPricesDiv);

  productDetailsContainer.appendChild(newProductDiv);
});
