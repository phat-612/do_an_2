const Handlebars = require("handlebars");
const moment = require("moment");
module.exports = {
  sum: (a, b) => a + b,
  hiddenSentence: (sentence) => sentence.replace(/[^\s]/g, "-"),
  compare: (a, b) => a == b,
  objectToLi: (object) => {
    let outputString = "";
    Object.keys(object).forEach((key, index) => {
      outputString += `<li>${key}: ${object[key]}</li>`;
    });
    return outputString;
  },
  showDate: (date) => {
    if (date instanceof Date || date == undefined) return "";
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
            <div class="title fs-4 my-3 text-capitalize">${variation[key]}</div>
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
  showPrice: (...args) => {
    const numbers = args.filter((arg) => typeof arg === "number");
    const res = numbers.reduce((a, b) => a * b, 1);
    return res.toLocaleString("vi-VN");
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
  // chuyển đổi thành chuỗi
  printObject: (object) => {
    return new Handlebars.SafeString(JSON.stringify(object, null, 2));
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
  formatDate: (datetime, format) => {
    if (moment) {
      format = format || "DD/MM/YYYY";
      return moment(datetime).format(format);
    } else {
      return datetime;
    }
  },
};
