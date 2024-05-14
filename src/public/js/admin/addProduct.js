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
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="thuocTinh1 form-control col mx-2 variations">
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute1Btn.addEventListener("click", () => {
  var inputAttribute1Div = document.getElementById("inputAttribute1Div");
  var secondChild = inputAttribute1Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute1HTML);
  document.querySelectorAll(".variations").forEach(function (input) {
    input.addEventListener("input", createAttri1Row);
  });
});

// nút them thuoc tinh 2

var addAttribute2Btn = document.querySelector(".addAttribute2-btn");
var Attribute2HTML = `<div class="row my-2">
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="thuocTinh2 form-control col mx-2 variations">
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute2Btn.addEventListener("click", () => {
  var inputAttribute2Div = document.getElementById("inputAttribute2Div");
  var secondChild = inputAttribute2Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute2HTML);
  document.querySelectorAll(".variations").forEach(function (input) {
    input.addEventListener("input", createAttri1Row);
  });
});
//  ====================================================

function createAttri1Row() {
  var nameAttr1 = document.getElementById("inpNameAttributePro1").value;
  var nameAttr2 = document.getElementById("inpNameAttributePro2").value;
  var attr1Values = Array.from(document.querySelectorAll(".thuocTinh1")).map(
    (input) => input.value
  );
  var attr2Values = Array.from(document.querySelectorAll(".thuocTinh2")).map(
    (input) => input.value
  );

  var numberRow1 = attr1Values.length;
  var numberRow2 = attr2Values.length;

  document.querySelector(".th1").textContent = nameAttr1;
  document.querySelector(".th2").textContent = nameAttr2;
  console.log(attr1Values, attr2Values);

  let tbody = document.querySelector("tbody");
  let tbodyHTML = "";

  let currentRow = 0;

  attr1Values.forEach((val1, ind1) => {
    attr2Values.forEach((val2, ind2) => {
      if (ind2 === 0) {
        tbodyHTML += `
          <tr>
            <td class="td1" rowspan="${numberRow2}">${val1}</td>
            <td>${val2}</td>
            <td><input type="number" class="form-control w-50 variations" name="variations[${currentRow}][price]" required></td>
            <td><input type="number" class="form-control w-50 variations" name="variations[${currentRow}][quantity]"></td>
            <input type="text" value="${val1}" name="variations[${currentRow}][attributes][${nameAttr1}]" hidden />
            <input type="text" value="${val2}" name="variations[${currentRow}][attributes][${nameAttr2}]" hidden />
          </tr>
        `;
        currentRow++;
      } else {
        if (val2) {
          tbodyHTML += `
          <tr>
            <td>${val2}</td>
            <td><input type="number" class="form-control w-50 variations" name="variations[${currentRow}][price]" required></td>
            <td><input type="number" class="form-control w-50 variations" name="variations[${currentRow}][quantity]" required></td>
            <input type="text" value="${val1}" name="variations[${currentRow}][attributes][${nameAttr1}]" hidden />
            <input type="text" value="${val2}" name="variations[${currentRow}][attributes][${nameAttr2}]" hidden />
          </tr>
        `;
          currentRow++;
        }
      }
    });
  });
  tbody.innerHTML = tbodyHTML;
}

document.querySelectorAll(".variations").forEach(function (input) {
  input.addEventListener("input", createAttri1Row);
});

const percentInput = document.getElementById("percentInput");
const discountStart = document.getElementById("discountStart");
const discountEnd = document.getElementById("discountEnd");

function checkExistValue() {
  if (!percentInput.value || percentInput.value == 0) {
    discountStart.setAttribute("disabled", "true");
    discountEnd.setAttribute("disabled", "true");
  } else {
    discountStart.removeAttribute("disabled");
    discountStart.setAttribute("required", "true");
    discountEnd.removeAttribute("disabled");
    discountEnd.setAttribute("required", "true");
  }
}
percentInput.addEventListener("input", checkExistValue);
