document
  .querySelectorAll(
    'input[name="reason"], input[name="price"], select[name="details"]'
  )
  .forEach((element) => {
    element.addEventListener("change", () => {
      // Lấy thông tin sản phẩm và lý do bảo hành
      const tableRow = element.closest("tr");
      const productName = tableRow.querySelector(
        'input[name="productName"]'
      ).value;
      const reasonElements = tableRow.querySelectorAll('input[name="reason"]');
      const priceElements = tableRow.querySelectorAll('input[name="price"]');
      const detailsIndex = element.selectedIndex;

      // Tạo mảng lý do bảo hành từ các phần tử input
      const reasonsAndPrices = [];
      for (let i = 0; i < reasonElements.length; i++) {
        const reason = reasonElements[i].value;
        const price = priceElements[i].value;
        reasonsAndPrices.push({ reason, price });
      }

      // Cập nhật dữ liệu trong mảng "details"
      const updatedDetails = [...req.body.details]; // Sử dụng req.body.details thay vì productsAndReasons
      updatedDetails[detailsIndex] = { productName, reasonsAndPrices };

      // Cập nhật giao diện người dùng với dữ liệu mới
      // Ví dụ: Đặt lại giá trị các phần tử input và select
      tableRow.querySelector('input[name="productName"]').value = productName;
      for (let i = 0; i < reasonElements.length; i++) {
        reasonElements[i].value = reasonsAndPrices[i].reason;
        priceElements[i].value = reasonsAndPrices[i].price;
      }

      // Cập nhật dữ liệu trong đối tượng req.body
      req.body.details = updatedDetails;
    });
  });
