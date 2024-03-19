var inputSanPham = document.getElementById("idsanpham");
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
    var input = document.createElement("input");
    input.className = "form-control";
    input.type = "text";
    input.placeholder = "";
    input.value = selectedProduct;
    addInputGroup.appendChild(deleteButton);
    addInputGroup.appendChild(input);
    addInput.appendChild(addInputGroup);
    inputSanPham.value = "";
  }
});
