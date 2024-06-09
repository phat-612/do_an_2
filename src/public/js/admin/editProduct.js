let tbody = document.querySelector("tbody");

// =============================================
function deleteAttribute(event) {
  event.target.closest(".row").remove();
}

// ===================================== ảnh ================================================================================================
document.addEventListener("DOMContentLoaded", function () {
  let multiImageUpload = document.getElementById("multiImageUpload");
  let multiImagePreview = document.getElementById("multiImagePreview");
  let countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
  const maxFiles = 8;

  // để tạo một FileList chứa file đơn lẻ và gán nó cho thẻ input mới.
  function createFileList(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer.files;
  }

  // tạo ảnh
  function createPreviewImage(src, index) {
    const preview = document.createElement("img");
    preview.src = src;
    preview.classList.add("img-fluid");
    preview.dataset.index = index;
    return preview;
  }

  // tạo input file ẩn để lưu file
  function createPreviewHiddenInput(file, index) {
    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.setAttribute("hidden", "true");
    newFileInput.setAttribute("name", "images1");
    newFileInput.files = createFileList(file);
    newFileInput.dataset.index = index;
    return newFileInput;
  }

  multiImageUpload.addEventListener("change", function (event) {
    let files = Array.from(multiImageUpload.files);
    if (files.length + countOnDiv > maxFiles) {
      alert("Vui lòng chọn không quá " + (maxFiles - countOnDiv) + " tệp.");
      multiImageUpload.value = ""; // Reset input
      return;
    } else {
      files.forEach(function (file, index) {
        const preview = createPreviewImage(URL.createObjectURL(file), index);
        const newFileInput = createPreviewHiddenInput(file, index);
        const colDiv = document.createElement("div");
        colDiv.classList.add("col-3");
        colDiv.appendChild(preview);
        colDiv.appendChild(newFileInput);
        multiImagePreview.appendChild(colDiv);
      });
      countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
      multiImageUpload.value = ""; // Reset input
    }

    // sự kiện xóa
    $("img").on("click", function (event) {
      const isDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này không?");
      if (!isDelete) {
        return;
      } else {
        $(this).closest("div.col-3").remove();
        const indDelete = event.target.dataset.index;
        const fileArray = Array.from(multiImageUpload.files);
        fileArray.splice(indDelete, 1);
        const dataTransfer = new DataTransfer();
        fileArray.forEach((file) => {
          dataTransfer.items.add(file);
        });
        multiImageUpload.files = dataTransfer.files;
        countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
      }
    });
  });
  // sự kiện xóa
  $("img").on("click", function (event) {
    const isDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này không?");
    if (!isDelete) {
      return;
    } else {
      $(this).closest("div.col-3").remove();
      const indDelete = event.target.dataset.index;
      const fileArray = Array.from(multiImageUpload.files);
      fileArray.splice(indDelete, 1);
      const dataTransfer = new DataTransfer();
      fileArray.forEach((file) => {
        dataTransfer.items.add(file);
      });
      multiImageUpload.files = dataTransfer.files;
      countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
    }
  });
});

//   ==========================================================================================================================================================

// xử lý phân loại

// xử lý 2 cái tiêu đề tên
$("#inpNameAttributePro1").on("input", (e) => {
  let value = e.target.value.trim();
  $(".th1").text(value);
});
$("#inpNameAttributePro2").on("input", (e) => {
  if ($("#inpNameAttributePro1").val() == "") {
    e.target.value = "";
    return;
  }
  let value = e.target.value.trim();
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
      onclick="deleteValue(1,event)"
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
      onclick="deleteValue(2,event)"
    >Xóa</button>
  </div>`;
  $(".areaInpValue2").prepend(html);
});
// thêm giá trị vào bảng
function handleInpValue(valAttr, event) {
  let attr = valAttr;
  let row = $(event.target.closest(".row"));
  let indInp = $(row.parent()).find(".row").length - $(row).index() - 1;
  let arrValueAttr1 = $(".valueAttr1")
    .map(function () {
      return $(this).val().trim();
    })
    .get()
    .reverse();
  console.log(arrValueAttr1);
  let arrValueAttr2 = $(".valueAttr2")
    .map(function () {
      return $(this).val();
    })
    .get()
    .reverse();
  console.log(arrValueAttr2);
  let countCurValue = $(row.parent()).find(".row").length;
  let countAttr1Value = $(".areaInpValue1 .row").length;
  let countAttr2Value = $(".areaInpValue2 .row").length;
  let countRowTable = $("tbody").children().length;
  let checkEnoughRow = countAttr1Value * countAttr2Value == countRowTable;
  let valueInp = event.target.value.trim();
  if (attr == 1) {
    // input attrValue1
    // if (valueInp == "") return;
    if ($("#inpNameAttributePro1").val() == "") {
      event.target.value = "";
      return;
    }
    let arrIndRow = [];
    for (let i = 0; i < countAttr2Value; i++) {
      let numberRow = indInp * countAttr2Value + i;
      arrIndRow.push(numberRow);
    }
    if (!checkEnoughRow) {
      // không đủ hàng thì thêm hàng mới
      arrIndRow.forEach((indRow, ind) => {
        if (countRowTable == 0) {
          let html = genRowTable(valueInp, arrValueAttr2[0]);
          $("tbody").append(html);
          countRowTable++;
        } else {
          let rowTable = $("tbody")
            .children()
            .eq(indRow - 1);
          let html = genRowTable(valueInp, arrValueAttr2[ind]);
          rowTable.after(html);
        }
      });
    } else {
      // đủ hàng thì chỉ cần thay đổi giá trị
      arrIndRow.forEach((indRow) => {
        let rowTable = $("tbody").children().eq(indRow);
        rowTable.find("td").eq(0).text(valueInp);
      });
    }
  } else {
    // input attrValue2
    // nếu chưa nhập attr1 thì không thêm
    if (countRowTable == 0) {
      event.target.value = "";
      return;
    }
    let arrIndRow = [];
    for (let i = 0; i < countAttr1Value; i++) {
      let numberRow = indInp + countAttr2Value * i;
      arrIndRow.push(numberRow);
    }
    if (!checkEnoughRow) {
      // không đủ hàng thì thêm hàng mới
      arrIndRow.forEach((indRow, ind) => {
        let rowTable = $("tbody")
          .children()
          .eq(indRow - 1);
        let html = genRowTable(arrValueAttr1[ind], valueInp);
        rowTable.after(html);
      });
    } else {
      // đủ hàng thì chỉ cần thay đổi giá trị
      arrIndRow.forEach((indRow) => {
        let rowTable = $("tbody").children().eq(indRow);
        rowTable.find("td").eq(1).text(valueInp);
      });
    }
  }
  renameNameValueTable();
}
function deleteValue(valAttr, event) {
  let attr = valAttr;
  let row = $(event.target.closest(".row"));
  let indInp = $(row.parent()).find(".row").length - $(row).index() - 1;
  let countCurValue = $(row.parent()).find(".row").length;
  let countAttr1Value = $(".areaInpValue1 .row").length;
  let countAttr2Value = $(".areaInpValue2 .row").length;
  let countRowTable = $("tbody").children().length;
  let checkEnoughRow = countAttr1Value * countAttr2Value == countRowTable;
  let arrIndRow = [];
  if (attr == 1) {
    for (let i = 0; i < countAttr2Value; i++) {
      let numberRow = indInp * countAttr2Value + i;
      arrIndRow.push(numberRow);
    }
  } else {
    for (let i = 0; i < countAttr1Value; i++) {
      let numberRow = indInp + countAttr2Value * i;
      arrIndRow.push(numberRow);
    }
  }
  arrIndRow.forEach((indRow, ind) => {
    let rowTable = $("tbody")
      .children()
      .eq(indRow - ind);
    rowTable.remove();
  });
  row.remove();
  renameNameValueTable();
}
function deleteVariation(event) {
  let row = $(event.target.closest("tr"));
  row.find("td>input").val(0);
}
function genRowTable(td1, td2) {
  return `
  <tr>
  
    <td>${td1}</td>
    <td>${td2}</td>
    <td><input type="number" class="form-control" name="" /></td>
    <td><input type="number" class="form-control" name="" /></td>
    <td>
      <div class="areaInpHidden"></div>
      <button
        type="button"
        onclick="deleteVariation(event)"
        class="btn btn-danger"
      >Xóa phân loại</button></td>
  </tr>
  `;
}
function renameNameValueTable() {
  let nameAttr1 = $("#inpNameAttributePro1").val().trim();
  let nameAttr2 = $("#inpNameAttributePro2").val().trim();

  $("tbody tr").each((ind, tr) => {
    let value1 = $(tr).find("td").eq(0).text();
    let value2 = $(tr).find("td").eq(1).text();
    let htmlInpHidden = `
      <input
        type="text"
        name="variations[${ind}][attributes][${nameAttr1}]"
        value="${value1}"
        hidden
      />
      `;
    if (nameAttr2 != "" && value2 != "") {
      htmlInpHidden += `
        <input
          type="text"
          name="variations[${ind}][attributes][${nameAttr2}]"
          value="${value2}"
          hidden
        />
      `;
    }
    $(tr)
      .find("td")
      .eq(2)
      .find("input")
      .attr("name", `variations[${ind}][price]`);
    $(tr)
      .find("td")
      .eq(3)
      .find("input")
      .attr("name", `variations[${ind}][quantity]`);
    $(tr).find("td .areaInpHidden").html(htmlInpHidden);
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
$("#discountStart").on("change", function () {
  discountEnd.min = discountStart.value;
});
percentInput.addEventListener("input", checkExistValue);
// ==========================================================================
window.onload = function () {
  checkExistValue();
};

// ghichu ================================================================= ghi chu =================================================================

// let historyImages = [];
// document
//   .getElementById("multiImageUpload")
//   .addEventListener("change", function (event) {
//     var fileInput = document.getElementById("multiImageUpload");
//     var files = fileInput.files;
//     // Số lượng tệp tối đa được phép tải lên
//     var maxFiles = 8;
//     if (files.length > maxFiles) {
//       alert("Vui lòng chọn không quá " + maxFiles + " tệp.");
//       let dataTransfer = new DataTransfer();
//       document.getElementById("multiImageUpload").files = dataTransfer.files;
//     }
//     var previewContainer = document.getElementById("multiImagePreview");
//     // previewContainer.innerHTML = "";
//     Array.from(event.target.files).forEach((file, ind) => {
//       var preview = document.createElement("img");
//       preview.src = URL.createObjectURL(file);
//       preview.classList.add("img-fluid", "col-md-4", "mb-3", "w-25", ind);
//       preview.onload = function () {
//         URL.revokeObjectURL(preview.src);
//       };
//       previewContainer.appendChild(preview);
//     });
//     // sự kiện xóa ảnh
//     $("img").on("click", function (event) {
//       let isDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này không ?");
//       if (!isDelete) return;
//       let indDelete = event.target.classList[event.target.classList.length - 1];
//       let fileArray = Array.from(
//         document.getElementById("multiImageUpload").files
//       );
//       fileArray.splice(indDelete, 1);
//       let dataTransfer = new DataTransfer();
//       fileArray.forEach((file) => {
//         dataTransfer.items.add(file);
//       });
//       document.getElementById("multiImageUpload").files = dataTransfer.files;
//       document
//         .getElementById("multiImageUpload")
//         .dispatchEvent(new Event("change"));
//     });
//   });
// code xử lý ảnh mới nhất 11:20PM 20/05/2024 =====================================================================================================
// document.addEventListener("DOMContentLoaded", function () {
//   let multiImageUpload = document.getElementById("multiImageUpload");
//   let multiImagePreview = document.getElementById("multiImagePreview");
//   let countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
//   const maxFiles = 8;

//   // tạo ảnh
//   function createFileList(file) {
//     const dataTransfer = new DataTransfer();
//     dataTransfer.items.add(file);
//     return dataTransfer.files;
//   }
//   function createPreviewImage(src, index) {
//     const preview = document.createElement("img");
//     preview.src = src;
//     preview.classList.add("img-fluid");
//     preview.dataset.index = index;
//     return preview;
//   }
//   function createPreviewHiddenInput(file, index) {
//     const newFileInput = document.createElement("input");
//     newFileInput.type = "file";
//     newFileInput.setAttribute("hidden", "true");
//     newFileInput.files = createFileList(file);
//     newFileInput.dataset.index = index;
//     return newFileInput;
//   }

//   multiImageUpload.addEventListener("change", function (event) {
//     let files = multiImageUpload.files;
//     if (files.length + countOnDiv > maxFiles) {
//       alert("Vui lòng chọn không quá " + (maxFiles - countOnDiv) + " tệp.");
//       multiImageUpload.value = ""; // Reset input
//       return;
//     } else {
//       Array.from(files).forEach(function (file, index) {
//         const preview = createPreviewImage(URL.createObjectURL(file), index);
//         const newFileInput = createPreviewHiddenInput(file, index);
//         const colDiv = document.createElement("div");
//         colDiv.classList.add("col-3");
//         colDiv.appendChild(preview, newFileInput);
//         multiImagePreview.appendChild(colDiv);
//       });
//       countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
//     }
//     $(document).ready(function () {
//       $("img").on("click", function (event) {
//         const isDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này không?");
//         if (!isDelete) {
//           return;
//         } else {
//           $(this).closest("div.col-3").remove();
//           let indDelete =
//             event.target.classList[event.target.classList.length - 1];
//           let fileArray = Array.from(
//             document.getElementById("multiImageUpload").files
//           );
//           fileArray.splice(indDelete, 1);
//           let dataTransfer = new DataTransfer();
//           fileArray.forEach((file) => {
//             dataTransfer.items.add(file);
//           });
//           document.getElementById("multiImageUpload").files =
//             dataTransfer.files;
//           countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
//           multiImageUpload.value = ""; // Reset input
//         }
//       });
//     });
//   });
//   $(document).ready(function () {
//     $("img").on("click", function (img) {
//       const isDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này không?");
//       if (!isDelete) {
//         return;
//       } else {
//         $(this).closest("div.col-3").remove();
//         countOnDiv = multiImagePreview.getElementsByClassName("col-3").length;
//       }
//     });
//   });
// });
