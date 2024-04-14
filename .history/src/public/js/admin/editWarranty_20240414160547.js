// Lắng nghe sự kiện thay đổi trên các phần tử input và select
document
  .querySelectorAll(
    'input[name="reason"], input[name="price"], select[name="details"]'
  )
  .forEach((element) => {
    element.addEventListener("change", () => {
      // Lấy thông tin sản phẩm và lý do bảo hành
      const productName = element
        .closest(".table-responsive")
        .querySelector('input[type="text"]').value;
      const reasonElements = element
        .closest(".table-responsive")
        .querySelectorAll('input[name="reason"]');
      const priceElements = element
        .closest(".table-responsive")
        .querySelectorAll('input[name="price"]');
      const detailsIndex = element
        .closest(".table-responsive")
        .querySelector('select[name="details"]').selectedIndex;

      // Tạo mảng lý do bảo hành từ các phần tử input
      const reasonsAndPrices = [];
      for (let i = 0; i < reasonElements.length; i++) {
        const reason = reasonElements[i].value;
        const price = priceElements[i].value;
        reasonsAndPrices.push({ reason, price });
      }

      // Cập nhật dữ liệu trong mảng "details"
      const details = [...productsAndReasons];
      details[detailsIndex] = {
        productName,
        reasonsAndPrices,
      };

      // Cập nhật giao diện người dùng với dữ liệu mới
      // Ví dụ: Đặt lại giá trị các phần tử input và select
      element
        .closest(".table-responsive")
        .querySelector('input[type="text"]').value = productName;
      for (let i = 0; i < reasonElements.length; i++) {
        reasonElements[i].value = reasonsAndPrices[i].reason;
        priceElements[i].value = reasonsAndPrices[i].price;
      }
    });
  });
