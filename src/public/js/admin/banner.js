// const chk = document.getElementById("chk");

// chk.addEventListener("change", () => {
//   document.body.classList.toggle("dark");
// });

// // SOCIAL PANEL JS
// const floating_btn = document.querySelector(".floating-btn");
// const close_btn = document.querySelector(".close-btn");
// const social_panel_container = document.querySelector(
//   ".social-panel-container"
// );

// floating_btn.addEventListener("click", () => {
//   social_panel_container.classList.toggle("visible");
// });

// close_btn.addEventListener("click", () => {
//   social_panel_container.classList.remove("visible");
// });
// change status
$(document).ready(function () {
  $(document).on("change", ".changeStatus", function () {
    const formId = $(this).data("formid");

    $("#" + formId).submit();
  });
});
//edit
document.addEventListener("DOMContentLoaded", function () {
  const bannerModal = document.getElementById("addBannerModal");

  bannerModal.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let linkAction = button.getAttribute("data-linkAction");
    bannerModal.querySelector("#editBanner").action = linkAction;

    let idBanner = button.getAttribute("data-id");
    let nameBanner = button.getAttribute("data-name");
    let linkBanner = button.getAttribute("data-link");
    let imageBanner = button.getAttribute("data-image");

    if (idBanner) {
      // banner đang được sửa
      bannerModal.querySelector("#name").value = nameBanner;
      bannerModal.querySelector("#link").value = linkBanner;
      bannerModal.querySelector("#preview-image").src = imageBanner;
      bannerModal.querySelector("#preview-image").classList.remove("d-none"); //nếu đang sửa, hiện ảnh
    } else {
      // đang thêm banner mới
      bannerModal.querySelector("#name").value = "";
      bannerModal.querySelector("#link").value = "";
      bannerModal.querySelector("#preview-image").src = "";
      bannerModal.querySelector("#preview-image").classList.add("d-none"); //nếu đang thêm, ẩn ảnh
    }
  });

  const editButtons = document.querySelectorAll(".edit-banner-btn");
  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const name = button.getAttribute("data-name");
      const link = button.getAttribute("data-link");
      const linkimage = button.getAttribute("data-linkImage");

      // Điền thông tin vào modal
      bannerModal.querySelector("#name").value = name;
      bannerModal.querySelector("#link").value = link;
      bannerModal.querySelector("#preview-image").src = linkimage;
    });
  });
});
//view
document.querySelectorAll(".btn-view").forEach(function (button) {
  button.addEventListener("click", function (event) {
    const image = event.currentTarget.getAttribute("data-image");
    document.querySelector("#viewImg").setAttribute("src", image);
  });
});
//xóa
var btnDelete = $(".btn-delete");
var deleteForm = $("form[name='bannerDelete']");
var deleteModal = $("#delete-banner-modal");
var toBeDeleted;

btnDelete.on("click", function (event) {
  toBeDeleted = $(this).data("delete");

  // Hiện modal xác nhận
  deleteModal.modal("show");
});

// Xác nhận xóa trong modal
$("#btn-delete").on("click", function () {
  deleteForm.attr(
    "action",
    "/api/deleteBanner/" + toBeDeleted + "?_method=DELETE"
  );
  deleteForm.submit();
  deleteModal.modal("hide");
});
// Hủy xóa
deleteModal.find(".btn-delete").on("click", function () {
  deleteModal.modal("hide");
});
