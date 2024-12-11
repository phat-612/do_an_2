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
// khi nhấn nút trả lời comment thì sẽ render form trả lời như form comment dưới comment đó
$(".btnAnswerComment").on("click", (e) => {
  // xóa tất cả phần tử có class là formAnswer
  $(".formAnswer").remove();
  let comment = $(e.target);
  let commentId = comment.attr("data-bs-idComment");
  let productId = comment.attr("data-bs-idProduct");
  let formAnswer = `
  <form class="send-qa row d-flex justify-content-between formAnswer" method="post" action="/api/user/answerComment">
      <input type="text" name="idComment" value="${commentId}" hidden>
      <input type="text" name="idProduct" value="${productId}" hidden>
      <textarea class="p-2 rounded col-10" name="comment" id="" placeholder="Nhập câu trả lời của bạn!"></textarea>
      <button type="submit" class="btn btn-primary col-2">Gửi</button>
    </form>
  `;
  comment.closest(".comment-item").append(formAnswer); // Corrected method
});
