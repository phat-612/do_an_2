const Handlebars = require("handlebars");
module.exports = {
  sum: (a, b) => a + b,
  hiddenSentence: (sentence) => sentence.replace(/[^\s]/g, "-"),
  compare: (a, b) => a == b,
  showDate: (date) => {
    const year = date.getFullYear();
    const month =
      parseInt(date.getMonth() + 1) < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day =
      parseInt(date.getDate() + 1) < 10 ? `0${date.getDate()}` : date.getDate();
    return `${year}-${month}-${day}`;
  },
  showDiscount: (discount) => {
    if (discount > 0) {
      return `<p
                class="position-absolute bg-danger p-1 text-white rounded-end-5"
              >Giảm ${discount} %</p>`;
    }
  },
  showDefaultPrice: (variations) => {
    const defaultPrizes = variations.map((variation) => variation.price);
    const minPrice = Math.min(...defaultPrizes);
    const maxPrice = Math.max(...defaultPrizes);
    if (minPrice == maxPrice) {
      return minPrice.toLocaleString("vi-VN");
    } else {
      return `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString(
        "vi-VN"
      )}`;
    }
  },
  showDiscountPrice: (variations, discount) => {
    const defaultPrizes = variations.map((variation) => variation.price);
    const minPrice = Math.min(...defaultPrizes) * (1 - discount.percent / 100);
    const maxPrice = Math.max(...defaultPrizes) * (1 - discount.percent / 100);
    if (minPrice == maxPrice) {
      return minPrice.toLocaleString("vi-VN");
    } else {
      return `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString(
        "vi-VN"
      )}`;
    }
  },
  showVariations: (variations) => {
    console.log(variations);
  },
  getBrands: (categories, rootCategory) => {
    const brands = categories.find((category) => category.slug == rootCategory);
    if (brands) {
      return brands.children.map((brand) => ({
        name: brand.name,
        slug: brand.slug,
      }));
    }
  },
  statusToast: (type) => {
    if (type == "success") {
      return "bg-success";
    }
    return "bg-danger";
  },
  isDisabled: (isDisabled) => {
    if (isDisabled) {
      return "disabled";
    }
    return "";
  },
};
