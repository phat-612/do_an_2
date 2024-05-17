// xử lý ảnh
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

//   discount
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

// xử lý phân loại

$("#inpNameAttributePro1").on("input", (e) => {
  let value = e.target.value;
  $(".th1").text(value);
});
$("#inpNameAttributePro2").on("input", (e) => {
  let value = e.target.value;
  $(".th2").text(value);
});

// Nút thêm giá trị
$(".btnAddValue1").on("click", function () {
  let html = `
  <div class="row my-2 attri1-box">
    <input
      type="text"
      placeholder="Giá trị"
      class="valueAttr1 form-control col mx-2 variations"
      oninput="handleInpValue(1,event)"
    />
    <button
      type="button"
      class="btn btn-danger col-2"
      onclick="deleteValue(event)"
    >Xóa</button>
  </div>`;
  $(".areaInpValue1").prepend(html);
});
$(".btnAddValue2").on("click", function () {
  let html = `
  <div class="row my-2 attri1-box">
    <input
      type="text"
      placeholder="Giá trị"
      class="valueAttr2 form-control col mx-2 variations"
      oninput="handleInpValue(2,event)"
    />
    <button
      type="button"
      class="btn btn-danger col-2"
      onclick="deleteValue(event)"
    >Xóa</button>
  </div>`;
  $(".areaInpValue2").prepend(html);
});
// thêm giá trị vào bảng
function handleInpValue(valAttr, event) {
  let attr = valAttr;
  let row = $(event.target.closest(".row"));
  let indInp = $(row.parent()).find(".row").length - $(row).index() - 1;
  let valueInp = event.target.value;
  console.log(attr, indInp);
  if ((attr = 1)) {
    let rowTable = $("tbody").children().eq(indInp);
    console.log(rowTable.length);
    if (rowTable.length == 0) {
      let html = genRowTable(
        valueInp,
        "",
        `quantity1[${indInp}]`,
        `price1[${indInp}]`
      );
      $("tbody").children().eq(indInp).append(html);
    }
  }
}
function deleteValue(event) {
  event.target.closest(".row").remove();
}
function deleteVariation(event) {
  let row = $(event.target.closest(".row"));
  row.find("input").val(0);
}
function genRowTable(td1, td2, nameInpQuantity, nameInpPrice) {
  return `
  <tr>
    <td>${td1}</td>
    <td>${td2}</td>
    <td><input type="number" name="${nameInpQuantity}" /></td>
    <td><input type="number" name="${nameInpPrice}" /></td>
    <td><button
        type="button"
        onclick="deleteVariation(event)"
        class="btn btn-danger"
      >Xóa phân loại</button></td>
  </tr>
  `;
}
