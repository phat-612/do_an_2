const Handlebars = require("handlebars");
const moment = require("moment");
module.exports = {
  sum: (a, b) => a + b,
  hiddenSentence: (sentence) => sentence.replace(/[^\s]/g, "-"),
  compare: (a, b) => a == b,
  compareNot: (a, b) => a != b,
  compareMore: (a, b) => a > b,
  compareLess: (a, b) => a < b,
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
  showStatusOrder: (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "success":
        return "Thành công";
      case "cancel":
        return "Đã hủy";
      case "shipping":
        return "Đang vận chuyển";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  },
  showPaymentMethod: (method) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng";
      case "online":
        return "Thanh toán online";
      default:
        return method;
    }
  },
  showPaymentStatus: (status) => {
    switch (status) {
      case "pending":
        return "Chờ Thanh Toán";
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "cancel":
        return "Đã hủy";
      default:
        return status;
    }
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
  discountPrice: (price, discount) => {
    return price * (1 - discount / 100);
  },
  totalPriceOrder: (details) => {
    return details.reduce((acc, detail) => {
      return acc + detail.price * detail.quantity;
    }, 0);
  },
  totalPriceDiscountOrder: (details) => {
    return details.reduce((acc, detail) => {
      return acc + (detail.price * detail.quantity * detail.discount) / 100;
    }, 0);
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
  isRadio: (value, currentValue) => {
    if (value == currentValue) {
      return "checked";
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
  // minh luan
  formatStatus: (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "success":
        return "Thành công";
      case "cancel":
        return "Đã hủy";
      case "shipping":
        return "Đang vận chuyển";
      case "cancel":
        return "Bị hủy";
      default:
        return status;
    }
  },
  salePriceProduct: (price, salePrice) => {
    return price - salePrice;
  },
  salePrice: (price, discout, quantity) => {
    return price * ((100 - discout) / 100) * quantity;
  },
  mutiple: (a, b) => a * b,
  changeStatus: (arg1, arg2) => {
    return arg1 == arg2;
  },

  isSelectedObejctId: (val, opt) => {
    return val.toString() == opt.toString() ? "selected" : "";
  },
  countOrdersPending: (orders) => {
    let count = 0;
    orders.forEach((order) => {
      if (order.status == "pending") {
        count++;
      }
    });
    return count;
  },
  countOrdersSuccess: (orders) => {
    let count = 0;
    orders.forEach((order) => {
      if (order.status == "success") {
        count++;
      }
    });
    return count;
  },
  checkOutOfStock: (products) => {
    let count = 0;
    products.forEach((product) => {
      let tempQuantity = 0;
      product.variations.forEach((variation) => {
        tempQuantity += variation.quantity;
      });
      if (tempQuantity == 0) {
        count++;
      }
    });
    return count;
  },
};
