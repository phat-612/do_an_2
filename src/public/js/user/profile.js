$(document).ready(function () {
  $("#btnUpdate").click(function () {
    $("input").prop("disabled", false);
    $("#inpGender").prop("disabled", false);
    $("#inpEmail").prop("disabled", true);
    $("#inpDateJoin").prop("disabled", true);
    $("#btnUpdate").hide();
    $("#btnSave").removeClass("d-none");
    $("#btnCancel").removeClass("d-none");
  });
});
