document.addEventListener("DOMContentLoaded", function () {
  const warrantyId ;
  $("#delete-warranty-modal").on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    warrantyId = button.data("id");
  });
  const btnDelete = document.getElementById("btnDelete");
  btnDelete.onclick = function () {

  }
});
