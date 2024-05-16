let tbody = document.querySelector("tbody");

// =============================================
function deleteAttribute(event) {
  event.target.closest(".row").remove();
  addAttributeName();
}

// ===================================== ảnh
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

let dataIMG = $("#multiImageUpload").attr("data-bs-datas");
let dataIMGArray = [];
let data = dataIMG.split(" ");

//   ==========================================================================================================================================================

// Nút thêm thuộc tính 1
var addAttribute1Btn = document.querySelector(".addAttribute1-btn");
var Attribute1HTML = `<div class="row my-2">
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="thuocTinh1 thuocTinh1moi form-control col mx-2 variations variationsmoi" required>
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute1Btn.addEventListener("click", () => {
  var inputAttribute1Div = document.getElementById("inputAttribute1Div");
  var secondChild = inputAttribute1Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute1HTML);
  addAttributeName();
});
// Nút thêm thuộc tính 2
var addAttribute2Btn = document.querySelector(".addAttribute2-btn");
var Attribute2HTML = `<div class="row my-2">
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="thuocTinh2 thuocTinh2moi form-control col mx-2 variations variationsmoi" required>
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute2Btn.addEventListener("click", () => {
  var inputAttribute2Div = document.getElementById("inputAttribute2Div");
  var secondChild = inputAttribute2Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute2HTML);
  addAttributeName();
  innerHTMLtd();
});
// // ==================================== create Table ================================================================================================ create Table
document
  .getElementById("inpNameAttributePro1")
  .addEventListener("input", () => {
    document.querySelector(".th1").textContent = document.getElementById(
      "inpNameAttributePro1"
    ).value;
  });

document
  .getElementById("inpNameAttributePro2")
  .addEventListener("input", () => {
    document.querySelector(".th2").textContent = document.getElementById(
      "inpNameAttributePro2"
    ).value;
  });
// ==================================================================
function getArrayAttr() {
  let attribute1Array = [];
  let attribute2Array = [];

  $(".thuocTinh1").each(function () {
    attribute1Array.push($(this).val());
    // console.log(attribute1Array);
  });
  $(".thuocTinh2").each(function () {
    attribute2Array.push($(this).val());
    // console.log(attribute2Array);
  });
}
// ===================================================================
function innerHTMLtd() {
  let attribute1Array = [];
  let attribute2Array = [];
  $(".thuocTinh1").each(function () {
    attribute1Array.push($(this).val());
    console.log(attribute1Array);
  });
  $(".thuocTinh2").each(function () {
    attribute2Array.push($(this).val());
    console.log(attribute2Array);
  });
  let tdHTML2 = "";
  attribute1Array.forEach(function (e) {
    tdHTML2 +=
      `
    <tr>
      <td class="td1">` +
      e +
      `<input type="text" class="tdAttribute1" value="" hidden name=""></td>
      <td class="td2"><input type="text" class="tdAttribute2" value="" hidden name=""></td>
      <td><input type="number" class="form-control tdPrice" value=""></td>
      <td><input type="number" class="form-control tdQuantity" value=""></td>
    </tr>
  `;
  });

  tbody.innerHTML = tdHTML2;
}

function addAttributeName() {
  let nameAttr1 = document.getElementById("inpNameAttributePro1").value;
  let nameAttr2 = document.getElementById("inpNameAttributePro2").value;

  let count = 0;

  $(".tdAttribute1").each(function () {
    $(this).attr(
      "name",
      "variations[" + count + "][attributes][" + nameAttr1 + "]"
    );
    count++;
  });
  count = 0;
  $(".tdAttribute2").each(function () {
    $(this).attr(
      "name",
      "variations[" + count + "][attributes][" + nameAttr2 + "]"
    );
    count++;
  });
  count = 0;
  $(".tdPrice").each(function () {
    $(this).attr("name", "variations[" + count + "][price]");
    count++;
  });

  count = 0;
  $(".tdQuantity").each(function () {
    $(this).attr("name", "variations[" + count + "][quantity]");
    count++;
  });
}

// ======================================= discount ==================================================================================================== discount
const percentInput = document.getElementById("percentInput");
const discountStart = document.getElementById("discountStart");
const discountEnd = document.getElementById("discountEnd");

function checkExistValue() {
  if (!percentInput.value || percentInput.value == 0) {
    discountStart.setAttribute("disabled", "true");
    discountEnd.setAttribute("disabled", "true");
  } else {
    discountStart.removeAttribute("disabled");
    discountEnd.removeAttribute("disabled");
  }
}
percentInput.addEventListener("input", checkExistValue);
// ==========================================================================
window.onload = function () {
  addAttributeName();
  getArrayAttr();
  checkExistValue();
};
