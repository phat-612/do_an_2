var inputSanPham = document.getElementById("detail");
var addInput = document.getElementById("addInput");
var addProductButton = document.getElementById("addProduct");

// Biến đếm cho sản phẩm, lý do và giá
var productCounter = 0;
var reasonCounter = 0;

addProductButton.addEventListener("click", function () {
  var selectedOption = inputSanPham.value;
  var selectedProductId = "";

  var options = document
  .getElementById("datalistOptions")
  .getElementsByTagName("option");
  for (var i = 0; i < options.length; i++) {
  if (options[i].innerText === selectedOption) {
  selectedProductId = options[i].id; // Lấy ID từ thuộc tính id của option
  break;
  }
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
      reasonCounter++; // Tăng biến đếm lý do
      var currentProductCounter = productCounter; // Lưu giá trị hiện tại của productCounter vào biến khác

      var newInputGroup = document.createElement("div");
      newInputGroup.className = "input-group mb-3";

      var newReasonInput = document.createElement("input");
      newReasonInput.className = "form-control";
      newReasonInput.type = "text";
      newReasonInput.placeholder = "Lý do";
      newReasonInput.name =
        "details[" +
        currentProductCounter +
        "][reasonAndPrice][" +
        reasonCounter +
        "][reason]"; // Lý do

      var newPriceInput = document.createElement("input");
      newPriceInput.className = "form-control";
      newPriceInput.type = "text";
      newPriceInput.placeholder = "Giá";
      newPriceInput.name =
        "details[" +
        currentProductCounter +
        "][reasonAndPrice][" +
        reasonCounter +
        "][price]"; // Giá

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
    reasonCounter = 0; // Đặt lại biến đếm lý do về 0
  }
});

inputSanPham.addEventListener("change", function () {
  reasonCounter = 0; // Đặt lại biến đếm lý do về 0 khi sản phẩm được chọn thay đổi
});
