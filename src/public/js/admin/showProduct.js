$(".form-removeProduct").on("submit", function (e) {
  e.preventDefault();
  let isDelete = confirm("Bạn Có Chắc Chắn Muốn Xóa Sản Phẩm Này Không ???");
  if (isDelete) {
    e.target.submit();
  }
});
$("#formFilter").on("submit", function (e) {
  e.preventDefault();
  let url = $(this).attr("action");
  let match = $("input[name='match']:checked").val();
  let href = `${url}&match=${match}`;
  window.location.href = href;
});
