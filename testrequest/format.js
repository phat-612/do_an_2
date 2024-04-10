// =====================================
document
  .getElementById("multiImageUpload")
  .addEventListener("change", function (event) {
    var fileInput = document.getElementById("multiImageUpload");
    var files = fileInput.files;
    // Số lượng tệp tối đa được phép tải lên
    var maxFiles = 8;
    if (files.length > maxFiles) {
      alert("Vui lòng chọn không quá " + maxFiles + " tệp.");
      let dataTransfer = new DataTransfer();
      document.getElementById("multiImageUpload").files = dataTransfer.files;
    }
    var previewContainer = document.getElementById("multiImagePreview");
    previewContainer.innerHTML = ""; // Clear existing previews
    Array.from(event.target.files).forEach((file, ind) => {
      var preview = document.createElement("img");
      preview.src = URL.createObjectURL(file);
      preview.classList.add("img-fluid", "col-md-4", "mb-3", "w-25", ind);
      preview.onload = function () {
        URL.revokeObjectURL(preview.src);
      };
      previewContainer.appendChild(preview);
    });
    document.querySelectorAll("#multiImagePreview img").forEach((preview) => {
      preview.addEventListener("click", function (event) {
        // console.log(event.target.classList[event.target.classList.length - 1]);
        let isDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này không ?");
        if (!isDelete) return;
        let indDelete =
          event.target.classList[event.target.classList.length - 1];
        let fileArray = Array.from(
          document.getElementById("multiImageUpload").files
        );
        fileArray.splice(indDelete, 1);
        let dataTransfer = new DataTransfer();
        fileArray.forEach((file) => {
          dataTransfer.items.add(file);
        });
        document.getElementById("multiImageUpload").files = dataTransfer.files;
        document
          .getElementById("multiImageUpload")
          .dispatchEvent(new Event("change"));
      });
    });
  });
//   ================================

// nút them thuoc tinh 1

var addAttribute1Btn = document.querySelector(".addAttribute1-btn");
var Attribute1HTML = `<div class="row">
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="form-control my-2 col">
               <button type="button" class="btn btn-danger col-2 my-2">Xóa</button>
            </div>`;

addAttribute1Btn.addEventListener("click", () => {
  var inputAttribute1Div = document.getElementById("inputAttribute1Div");
  var secondChild = inputAttribute1Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute1HTML);
});

// nut them bang thuoc tinh 2

var addAttribute2HTML = `<div class="row">
         <div class="col-md-6">
            <label for="ipNameAttributePro2" class="form-label fs-5">Nhập Tên Thuộc Tính</label>
         </div>
         <div class="col-md-6">
            <input type="text" id="ipNameAttributePro2" class="form-control" placeholder=" Nhập Tên Thuộc Tính">
         </div>
         <div class="col-md-6 my-3">
            <label for="" class="form-label fs-5">Nhập Thuộc Tính</label>
         </div>
         <div class="col-md-6 my-3" id="inputAttribute2Div">
            <button type="button" class="btn btn-success form-control addAttribute2-btn">Thêm Thuộc Tính</button>
            <input type="text" id="" placeholder="Nhập Thuộc Tính" class="form-control my-2">
         </div>
      </div>`;

document.querySelector(".addAttributebtn").addEventListener("click", () => {
  document.querySelector(".Attribute2div").innerHTML = addAttribute2HTML;
});

// nút them thuoc tinh 2
var addAttribute2Btn = document.querySelector(".addAttribute2-btn");
var Attribute2HTML = `<input type="text" id="" placeholder="Nhập Thuộc Tính" class="inpAttribute2 form-control my-2">`;

addAttribute2Btn.addEventListener("click", () => {
  var inputAttribute2Div = document.getElementById("inputAttribute2Div");
  var secondChild = inputAttribute2Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute2HTML);
});

$$(".inpAttribute").onKeyPress(() => {
  console.log("clicked");
});
// ============================================
// gợi ý cách làm cái bảng
// Lấy tất cả các giá trị từ các ô input có class attr1 và attr2
var attr1Values = Array.from(document.querySelectorAll(".attr1")).map(
  (input) => input.value
);
var attr2Values = Array.from(document.querySelectorAll(".attr2")).map(
  (input) => input.value
);

// Tạo ra một bảng mới
var table = document.createElement("table");

// Tạo ra hàng tiêu đề cho bảng
var thead = document.createElement("thead");
var headerRow = document.createElement("tr");
["Attribute 1", "Attribute 2", "Quantity"].forEach((text) => {
  var th = document.createElement("th");
  th.textContent = text;
  headerRow.appendChild(th);
});
thead.appendChild(headerRow);
table.appendChild(thead);

// Tạo ra các hàng cho bảng từ các giá trị attr1 và attr2
var tbody = document.createElement("tbody");
for (let i = 0; i < attr1Values.length; i++) {
  var row = document.createElement("tr");
  [attr1Values[i], attr2Values[i]].forEach((value) => {
    var td = document.createElement("td");
    td.textContent = value;
    row.appendChild(td);
  });

  // Thêm một ô input để nhập số lượng
  var quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.min = "0";
  var td = document.createElement("td");
  td.appendChild(quantityInput);
  row.appendChild(td);

  tbody.appendChild(row);
}
table.appendChild(tbody);
document.body.appendChild(table);
// =============================================
