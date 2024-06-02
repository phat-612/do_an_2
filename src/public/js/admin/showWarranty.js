document.addEventListener("DOMContentLoaded", function () {
  var warrantyId;
  var btnDelete = document.getElementById("btn-delete");
  var deleteForm = document.forms["warrantyDelete"];
  $("#delete-warranty-modal").on("show.bs.modal", function (event) {
    var button = $(event.relatedTarget);
    warrantyId = button.data("id");
  });
  btnDelete.onclick = function () {
    deleteForm.action = "/api/warranty/" + warrantyId + "?_method=DELETE";
    deleteForm.submit();
  };
});
$(document).ready(function () {
  $(".status-select").change(function () {
    var newValue = this.value;
    var selectedOption = $(this).children("option:selected");
    var id = selectedOption.data("id");

    fetch("/api/statusWarranty/" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newValue, id: id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        $(".toast-body").text(data.message);
        $("#liveToast").addClass("bg-success");
        $("#liveToast").toast("show");
        console.log("Yêu cầu đã được gửi thành công");
      })
      .catch((error) => console.error("Lỗi:", error));
  });
});
