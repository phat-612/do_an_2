document.addEventListener("DOMContentLoaded", function () {
  var warrantyId;
  var btnDelete = document.getElementById("btn-delete");
  var deleteForm = document.forms["warrantyDelete"];
  $("#delete-warranty-modal").on("show.bs.modal", function (event) {
    var button = $(event.relatedTarget);
    warrantyId = button.data("id");
  });
  btnDelete.onclick = function () {
    deleteForm.action = "/admin/warranty/" + warrantyId + "?_method=delete";
    deleteForm.submit();
  };
});
