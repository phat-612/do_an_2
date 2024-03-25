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
  $("#btnCancel").click(function () {
    $("input[type='reset']").click();
    $("input").prop("disabled", true);
    $("#inpGender").prop("disabled", true);
    $("#btnUpdate").show();
    $("#btnSave").addClass("d-none");
    $("#btnCancel").addClass("d-none");
  });
});
