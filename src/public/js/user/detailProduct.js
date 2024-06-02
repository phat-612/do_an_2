$('input[name="rating"]').on("change", (e) => {
  let radio = $(e.target);
  let value = parseInt(radio.val());
  $(".rating span").each((ind, ele) => {
    if (ind < value) {
      $(ele).addClass("text-warning");
    } else {
      $(ele).removeClass("text-warning");
    }
  });
});
$("#sendReviewModal textarea").on("input", (e) => {
  let text = $(e.target).val();
  let length = text.length;
  if (length > 250) {
    $(e.target).val(text.slice(0, 250));
    length = 250;
  }
  $("#sendReviewModal .countCharacter").text(length);
});
