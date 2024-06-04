$(".form-removeProduct").on("submit", function (e) {
  e.preventDefault();
  let isDelete = confirm("Bạn Có Chắc Chắn Muốn Xóa Sản Phẩm Này Không ???");
  if (isDelete) {
    e.target.submit();
  }
});

// var slider = document.getElementById("slider");

// noUiSlider.create(slider, {
//   start: [0, 51000000],
//   connect: true,
//   range: {
//     min: 0,
//     max: 51000000,
//   },
//   step: 10000,
//   tooltips: {
//     to: function (value) {
//       return new Intl.NumberFormat(
//         "vi-VN",
//         { style: "currency", currency: "VND" },
//         {
//           maximumSignificantDigits: 3,
//         }
//       ).format(Math.round(value));
//     },
//   },
// });
// slider.noUiSlider.on("update", function (values, handle) {
//   $(".start-price").text(
//     new Intl.NumberFormat(
//       "vi-VN",
//       { style: "currency", currency: "VND" },
//       {
//         maximumSignificantDigits: 3,
//       }
//     ).format(Math.round(values[0]))
//   );
//   $(".end-price").text(
//     new Intl.NumberFormat(
//       "vi-VN",
//       { style: "currency", currency: "VND" },
//       {
//         maximumSignificantDigits: 3,
//       }
//     ).format(Math.round(values[1]))
//   );
// });
