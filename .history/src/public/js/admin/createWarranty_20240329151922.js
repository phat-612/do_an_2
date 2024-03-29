var inputSanPham = document.getElementById("detail");
var addInput = document.getElementById("addInput");
var addProductButton = document.getElementById("addProduct");
var productCounter = 0; // Biến đếm sản phẩm

addProductButton.addEventListener("click", function () {
  var selectedOption = inputSanPham.value;

  if (selectedOption !== "") {
    var addInputGroup = document.createElement("div");
    addInputGroup.className = "input-group mb-3";

    var productNameInput = document.createElement("input");
    productNameInput.className = "form-control";
    productNameInput.type = "text";
    productNameInput.value = selectedOption;
    productNameInput.disabled = true;
    productNameInput.name = "detail[" + productCounter + "]"; // Thêm chỉ số sản phẩm vào tên trường

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-secondary delete-button";
    deleteButton.type = "button";
    deleteButton.innerText = "Xóa";

    deleteButton.addEventListener("click", function () {
      addInputGroup.remove(); // Xóa sản phẩm khi nút xóa được nhấp vào
    });

    var addButton = document.createElement("button");
    addButton.className = "btn btn-outline-secondary";
    addButton.type = "button";
    addButton.innerText = "Cộng";
    addButton.addEventListener("click", function () {
      var currentProductCounter = productCounter; // Lưu giá trị hiện tại của productCounter vào biến khác

      var newInputGroup = document.createElement("div");
      newInputGroup.className = "input-group mb-3";

      var newReasonInput = document.createElement("input");
      newReasonInput.className = "form-control";
      newReasonInput.type = "text";
      newReasonInput.placeholder = "Lý do";
      newReasonInput.name = "detail[" + currentProductCounter + "][reason][]"; // Tên trường lý do của sản phẩm

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.name = "detail[" + currentProductCounter + "][price][]"; // Tên trường giá của sản phẩm

      var newDeleteButton = document.createElement("button");
      newDeleteButton.className = "btn btn-outline-secondary delete-button";
      newDeleteButton.type = "button";
      newDeleteButton.innerText = "Xóa";

      newDeleteButton.addEventListener("click", function () {
        newInputGroup.remove(); // Xóa chi tiết khi nút xóa được nhấp vào
      });

      newInputGroup.appendChild(newReasonInput);
      newInputGroup.appendChild(newPriceInput);
      newInputGroup.appendChild(newDeleteButton);

      addInputGroup.appendChild(newInputGroup);
    });

    addInputGroup.appendChild(productNameInput);
    addInputGroup.appendChild(deleteButton);
    addInputGroup.appendChild(addButton);

    addInput.appendChild(addInputGroup);

    inputSanPham.value = "";
    productCounter++; // Tăng biến đếm sản phẩm
  }
});
