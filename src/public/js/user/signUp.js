$("#confirmPassword").on("focus", function () {
  if ($("#password").val() === "") {
    $("#password").focus();
  }
});
$("#confirmPassword").on("keyup", function () {
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();
  if (password !== confirmPassword) {
    $("#errorPassword").removeClass("opacity-0");
  } else {
    $("#errorPassword").addClass("opacity-0");
  }
});
$("form").on("submit", function (event) {
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();
  if (password !== confirmPassword) {
    event.preventDefault();
    $("#errorPassword").removeClass("opacity-0");
  }
});
