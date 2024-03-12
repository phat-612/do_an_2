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

// nút them SP
var addDetailBtn = document.querySelector(".addDetail-btn");
var detailHTML = `<input type="text" id="" placeholder="Nhập Chi Tiết" class="form-control my-2">`;

addDetailBtn.addEventListener("click", () => {
  var inputDetailDiv = document.getElementById("inputDetailDiv");
  var secondChild = inputDetailDiv.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", detailHTML);
});

// nút them thuoc tinh
var addAttributeBtn = document.querySelector(".addAttribute-btn");
var attributeHTML = `<input type="text" class="inpAttribute" id="" placeholder="Nhập Thuộc Tính" class="form-control my-2">`;

addAttributeBtn.addEventListener("click", () => {
  var inputAttributeDiv = document.getElementById("inputAttributeDiv");
  var secondChild = inputAttributeDiv.children[0]; // Lấy phần tử con thứ hai trong inputdiv
  secondChild.insertAdjacentHTML("afterend", attributeHTML);
});

$$(".inpAttribute").onKeyPress(() => {
  console.log("clicked");
});
