var tbody = document.querySelector("tbody");
// =============================================
function deleteAttribute(event) {
  // console.log(event.target);
  event.target.closest(".row").remove();
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
//   ==========================================================================================================================================================

// nút them thuoc tinh 1

var addAttribute1Btn = document.querySelector(".addAttribute1-btn");
var Attribute1HTML = `<div class="row my-2">
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="thuocTinh1 thuocTinh1moi form-control col mx-2 variations variationsmoi">
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute1Btn.addEventListener("click", () => {
  var inputAttribute1Div = document.getElementById("inputAttribute1Div");
  var secondChild = inputAttribute1Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute1HTML);
});
// nút them thuoc tinh 2
var addAttribute2Btn = document.querySelector(".addAttribute2-btn");
var Attribute2HTML = `<div class="row my-2">
               <input type="text" id="" placeholder="Nhập Thuộc Tính" class="thuocTinh2 thuocTinh2moi form-control col mx-2 variations variationsmoi">
               <button type="button" onclick="deleteAttribute(event)" class="btn btn-danger col-2">Xóa</button>
            </div>`;

addAttribute2Btn.addEventListener("click", () => {
  var inputAttribute2Div = document.getElementById("inputAttribute2Div");
  var secondChild = inputAttribute2Div.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", Attribute2HTML);
});
// // ==================================== create Table ================================================================================================ create Table

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
  count = 0; // Reset count for the next set of elements
  $(".tdPrice").each(function () {
    $(this).attr("name", "variations[" + count + "][price]");
    count++;
  });

  count = 0; // Reset count for the next set of elements
  $(".tdQuantity").each(function () {
    $(this).attr("name", "variations[" + count + "][quantity]");
    count++;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  addAttributeName();
});

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
