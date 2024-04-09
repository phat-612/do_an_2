var tbody = document.querySelector("tbody");
// =============================================
function deleteAttribute(event) {
  // console.log(event.target);
  event.target.closest(".row").remove();
}

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
var Attribute1HTML = `<div class="row my-2">
               <input type="text" id="thuocTinh1" placeholder="Nhập Thuộc Tính" class="form-control col mx-2">
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute1Btn.addEventListener("click", () => {
  var inputAttribute1Div = document.getElementById("inputAttribute1Div");
  var secondChild = inputAttribute1Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute1HTML);
  document.querySelectorAll("input").forEach(function (input) {
    input.addEventListener("input", createAttri1Row);
  });
});
// nút them thuoc tinh 2
var addAttribute2Btn = document.querySelector(".addAttribute2-btn");
var Attribute2HTML = `<div class="row my-2">
               <input type="text" id="thuocTinh2" placeholder="Nhập Thuộc Tính" class="form-control col mx-2">
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute2Btn.addEventListener("click", () => {
  var inputAttribute2Div = document.getElementById("inputAttribute2Div");
  var secondChild = inputAttribute2Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute2HTML);
  document.querySelectorAll("input").forEach(function (input) {
    input.addEventListener("input", createAttri1Row);
  });
});
// ====================================================

function createAttri1Row() {
  var nameAttr1 = document.getElementById("inpNameAttributePro1").value;
  var nameAttr2 = document.getElementById("inpNameAttributePro2").value;
  var attr1Values = Array.from(document.querySelectorAll("#thuocTinh1")).map(
    (input) => input.value
  );
  var attr2Values = Array.from(document.querySelectorAll("#thuocTinh2")).map(
    (input) => input.value
  );

  var numberRow1 = attr1Values.length;
  // console.log(attr1Values.reverse());
  var numberRow2 = attr2Values.length;
  // console.log(numberRow2);

  document.querySelector(".th1").textContent = nameAttr1;
  document.querySelector(".th2").textContent = nameAttr2;

  console.log("--------------------------------");
  let tbodyHTML = "";

  attr1Values.forEach((val1) => {
    attr2Values.forEach((val2, ind) => {
      if (ind == 0) {
        tbodyHTML += `<tr>
               <td class="td1" rowspan="${numberRow2}">${val1}</td>
               <td>${val2}</td>
               <td><input type="number" class="form-control w-50"></td>
               <td><input type="number" class="form-control w-50"></td>
            </tr>`;
      } else {
        tbodyHTML += `<tr>
               <td>${val2}</td>
               <td><input type="number" class="form-control w-50"></td>
               <td><input type="number" class="form-control w-50"></td>
            </tr>`;
      }
    });
  });
  tbody.innerHTML = tbodyHTML;
}

console.log("--------------------------------");

document.querySelectorAll("input").forEach(function (input) {
  input.addEventListener("input", createAttri1Row);
});

// ============================================
// // gợi ý cách làm cái bảng
// // Lấy tất cả các giá trị từ các ô input có class attr1 và attr2
// var attr1Values = Array.from(document.querySelectorAll(".attr1")).map(
//   (input) => input.value
// );
// var attr2Values = Array.from(document.querySelectorAll(".attr2")).map(
//   (input) => input.value
// );

// // Tạo ra một bảng mới
// var table = document.createElement("table");

// // Tạo ra hàng tiêu đề cho bảng
// var thead = document.createElement("thead");
// var headerRow = document.createElement("tr");
// ["Attribute 1", "Attribute 2", "Quantity"].forEach((text) => {
//   var th = document.createElement("th");
//   th.textContent = text;
//   headerRow.appendChild(th);
// });
// thead.appendChild(headerRow);
// table.appendChild(thead);

// // Tạo ra các hàng cho bảng từ các giá trị attr1 và attr2
// var tbody = document.createElement("tbody");
// for (let i = 0; i < attr1Values.length; i++) {
//   var row = document.createElement("tr");
//   [attr1Values[i], attr2Values[i]].forEach((value) => {
//     var td = document.createElement("td");
//     td.textContent = value;
//     row.appendChild(td);
//   });

//   // Thêm một ô input để nhập số lượng
//   var quantityInput = document.createElement("input");
//   quantityInput.type = "number";
//   quantityInput.min = "0";
//   var td = document.createElement("td");
//   td.appendChild(quantityInput);
//   row.appendChild(td);

//   tbody.appendChild(row);
// }
// table.appendChild(tbody);
// document.body.appendChild(table);
