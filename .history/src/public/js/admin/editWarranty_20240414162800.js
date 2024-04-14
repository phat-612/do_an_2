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
  var priceInputs = productContainer.querySelectorAll('li input[name="price"]');
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
