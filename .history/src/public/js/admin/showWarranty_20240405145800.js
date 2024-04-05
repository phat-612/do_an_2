document.addEventListener("DOMContentLoaded", function () {
  var warrantyId;
  $("#delete-warranty-modal").on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    warrantyId = button.data("id");
  });
  const btnDelete = document.getElementById("btn-delete");
  btnDelete.onclick = function () {
    alert();
  };
});
