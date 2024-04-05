document.addEventListener("DOMContentLoaded", function () {
  $("#delete-warranty-modal").on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    const id = button.data("id");
    console.log(id);
  });
  const btnDelete = document.getElementById("btn-Delete");
  // btnDelete.onclick = function () {
  //   alert();
  // };
  console.log(btnDelete);
});
