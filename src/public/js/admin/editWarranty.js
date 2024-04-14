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
