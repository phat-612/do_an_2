// Định nghĩa helper custom cho Handlebars
Handlebars.registerHelper("randomImage", function (images) {
  // Xác định một hình ảnh ngẫu nhiên từ mảng
  const randomIndex = Math.floor(Math.random() * images.length);
  const randomImage = images[randomIndex];

  // Trả về HTML của thẻ <img> chứa hình ảnh ngẫu nhiên
  return new Handlebars.SafeString(
    `<img src="/img/uploads/${randomImage}" alt="" class="w-25" />`
  );
});
