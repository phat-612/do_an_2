document.addEventListener("DOMContentLoaded", function () {
  var warrantyId;
  $("#delete-warranty-modal").on("show.bs.modal", function (event) {
    var button = $(event.relatedTarget);
    warrantyId = button.data("id");
  });
  var btnDelete = document.getElementById("btn-delete");
  btnDelete.onclick = function () {
    alert();
  };
});
