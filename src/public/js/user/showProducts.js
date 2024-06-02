var slider = document.getElementById("slider");
maxPrice = parseInt(maxPrice);
noUiSlider.create(slider, {
  start: [startPrice, endPrice],
  connect: true,
  range: {
    min: 0,
    max: maxPrice,
  },
  step: 10000,
});
slider.noUiSlider.on("update", function (values, handle) {
  $("input[name='startPrice']").val(Math.round(values[0]));
  $("input[name='endPrice']").val(Math.round(values[1]));
  $(".start-price").text(
    new Intl.NumberFormat(
      "vi-VN",
      { style: "currency", currency: "VND" },
      {
        maximumSignificantDigits: 3,
      }
    ).format(Math.round(values[0]))
  );
  $(".end-price").text(
    new Intl.NumberFormat(
      "vi-VN",
      { style: "currency", currency: "VND" },
      {
        maximumSignificantDigits: 3,
      }
    ).format(Math.round(values[1]))
  );
});
