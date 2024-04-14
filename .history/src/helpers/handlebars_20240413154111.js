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
  showVariations: (variations, curVariationSlug) => {
    let outputHtml = "";
    variations.forEach((variation) => {
      Object.keys(variation).forEach((key) => {
        if (key == "nameProperty") {
          outputHtml += `
          <div class="chose-color">
            <div class="title fs-4 my-3">${variation[key]}</div>
            <div class="body">
              <ul class="nav text-center">
          `;
        } else {
          let price = variation[key].price
            ? variation[key].price.toLocaleString("vi-VN")
            : "";
          let slug = variation[key].slug ? variation[key].slug : "";
          outputHtml += `
            <li
              class="py-1 px-3 me-3 bg-light border ${
                slug == curVariationSlug ? "border-danger" : ""
              } rounded"
              role="button"
            >
              <a href="${slug}"><strong>${key}</strong><div>${price}</div></a>
            </li>
          `;
        }
      });
      outputHtml += `</ul></div></div>`;
    });
    return outputHtml;
  },
  showPrice: (price) => price.toLocaleString("vi-VN"),
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
  consoleHbs: (data) => {
    console.log(data);
  },
};
