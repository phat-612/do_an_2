document
  .getElementById("saveButton")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của nút gửi biểu mẫu

    // Lấy giá trị từ các trường đầu vào HTML
    var productContainers = document.querySelectorAll(".col-12");
    var details = [];

    for (var i = 0; i < productContainers.length; i++) {
      var productContainer = productContainers[i];
      var productId = productContainer
        .querySelector(".m-1")
        .getAttribute("data-product-id");
      var reasonInputs = productContainer.querySelectorAll(
        'li input[name="reason"]'
      );
      var priceInputs = productContainer.querySelectorAll(
        'li input[name="price"]'
      );
      var reasonsAndPrices = [];

      for (var j = 0; j < reasonInputs.length; j++) {
        var reason = reasonInputs[j].value;
        var price = priceInputs[j].value;
        reasonsAndPrices.push({ reason: reason, price: price });
      }

      details.push({
        idProduct: productId,
        reasonAndPrice: reasonsAndPrices,
      });
    }

    // Tạo đối tượng dữ liệu JSON
    var data = {
      details: details,
    };

    // Gửi dữ liệu đến một URL hoặc xử lý dữ liệu theo ý muốn
    // Ví dụ: Gửi dữ liệu đến một URL thông qua phương thức POST
    fetch("/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(function (response) {
        // Xử lý phản hồi từ máy chủ hoặc cơ sở dữ liệu
        console.log("Dữ liệu đã được gửi thành công!");
      })
      .catch(function (error) {
        // Xử lý lỗi nếu có
        console.error("Lỗi khi gửi dữ liệu:", error);
      });
  });
