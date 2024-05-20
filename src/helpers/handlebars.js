const url = require("url");
const querystring = require("querystring");
const Handlebars = require("handlebars");
require("dotenv").config();
const moment = require("moment");
const { getDiscount } = require("../util/function");
const { type } = require("os");
module.exports = {
  sum: (a, b) => a + b,
  minus: (a, b) => a - b,
  hiddenSentence: (sentence) => sentence.replace(/[^\s]/g, "-"),
  notTrue: (a) => !a,
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
  showImgUpload: (img) => {
    if (typeof img == "object") {
      img = img[0];
    }
    if (img) {
      return `/${process.env.PATH_IMG_UPLOAD}/${img}`;
    }
    return "";
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
  showStatusWarranty: (status) => {
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
  showTagDiscount: (discount) => {
    if (typeof discount == "object") {
      discount = getDiscount(discount);
    }
    if (discount > 0) {
      return `<p
                class="position-absolute bg-danger p-1 text-white rounded-end-5 z-3  "
              >Giảm ${discount} %</p>`;
    }
  },
  showTdTableProduct: (attributes) => {
    let html = "";
    Object.keys(attributes).forEach((key, index) => {
      html += `
      <td class="td${index + 1}">${attributes[key]}</td>
      `;
    });
    if (Object.keys(attributes).length == 1) {
      html += `
      <td class="td2"></td>
      `;
    }
    return html;
  },
  showThTableProduct: (dataTable) => {
    let html = "";
    let attributes = dataTable[0].attributes;
    Object.keys(attributes).forEach((key, index) => {
      html += `
      <th class="th${index + 1} col-3">${key}</th>
      `;
    });
    if (Object.keys(attributes).length == 1) {
      html += `
      <th class="th2"></th>
      `;
    }
    return html;
  },
  showTagSoldout: (quantity) => {
    if (quantity == 0) {
      return `<p
                class="position-absolute bg-danger p-1 text-white rounded-end-5"
              >Hết hàng</p>`;
    }
  },
  showPriceInCard: (price, discount) => {
    let percentDiscount = getDiscount(discount);
    let a = `<p class="card-text text-decoration-line-through">
                  {{showPrice this.variation.price}}
                </p>
                <p class="card-text text-danger fs-4 fw-medium">
                  {{}}
                </p>`;
    if (percentDiscount > 0) {
      return `
        <p class="card-text text-decoration-line-through">
          ${price.toLocaleString("vi-VN")}
        </p>
        <p class="card-text text-danger fs-4 fw-medium">
          ${((price * (100 - percentDiscount)) / 100).toLocaleString("vi-VN")}
        </p>
      `;
    }
    return `
      <p class="card-text text-danger fs-4 fw-medium">
        ${price.toLocaleString("vi-VN")}
      </p>`;
  },
  showVariations: (variations, curVariationSlug, discount) => {
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
            ? (variation[key].price * (1 - discount / 100)).toLocaleString(
                "vi-VN"
              )
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
  totalPriceWarranty: (details) => {
    let totalPrice = 0;
    details.map((detail) => {
      totalPrice += detail.reasonAndPrice.reduce((acc, item) => {
        return acc + item.price;
      }, 0);
    });
    return totalPrice;
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
  isDiscount: (discount) => {
    const discountPercent = getDiscount(discount);
    return discountPercent > 0;
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
  isShowBtnRePayment: (paymentDetail) => {
    if (paymentDetail.method == "cod") {
      return false;
    }
    let statusArr = ["pending", "failed"];
    let isCheck = statusArr.some((item) => paymentDetail.status.includes(item));
    if (isCheck) {
      return true;
    }
    return false;
  },

  disabledQuantityZero: (quantity) => {
    if (quantity == 0) {
      return "disabled";
    }
    return "";
  },
  consoleHbs: (data) => {
    console.log(data);
  },
  formatDate: (datetime, format) => {
    if (datetime == undefined) {
      return "";
    } else {
      if (moment) {
        format = format || "DD/MM/YYYY";
        return moment(datetime).format(format);
      } else {
        return datetime;
      }
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
        return "Bị Hủy";
      case "shipping":
        return "Đang vận chuyển";
      case "failed":
        return "Thất Bại";
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
  // code phân trang https://gist.github.com/trantorLiu/5924389
  pagination: (currentPage, totalPage, size, options) => {
    if (totalPage == 1 || totalPage == 0) {
      return "";
    }
    var startPage, endPage, context;
    if (arguments.length === 3) {
      options = size;
      size = 5;
    }

    startPage = currentPage - Math.floor(size / 2);
    endPage = currentPage + Math.floor(size / 2);

    if (startPage <= 0) {
      endPage -= startPage - 1;
      startPage = 1;
    }

    if (endPage > totalPage) {
      endPage = totalPage;
      if (endPage - size + 1 > 0) {
        startPage = endPage - size + 1;
      } else {
        startPage = 1;
      }
    }

    context = {
      currentPage: currentPage,
      notFirstPage: false,
      pages: [],
      notLastPage: false,
    };
    if (currentPage !== 1) {
      context.notFirstPage = true;
    }
    for (var i = startPage; i <= endPage; i++) {
      context.pages.push({
        page: i,
        isCurrent: i === currentPage,
      });
    }
    if (currentPage !== totalPage) {
      context.notLastPage = true;
    }
    context.currentPage = currentPage;
    return options.fn(context);
  },
  getPagiUrl: (tempUrl) => {
    let parseUrl = url.parse(tempUrl, true);
    delete parseUrl.query.page;
    let isEmty = Object.keys(parseUrl.query).length == 0;
    parseUrl.search = querystring.stringify(parseUrl.query);
    let urlPagi = url.format(parseUrl);
    if (isEmty) {
      urlPagi = `${urlPagi}?`;
    }
    return urlPagi;
  },
  getSortUrl: (tempUrl) => {
    let parseUrl = url.parse(tempUrl, true);
    delete parseUrl.query.column;
    delete parseUrl.query.type;
    if (parseUrl.query._sort == undefined) {
      parseUrl.query._sort = "";
    }
    parseUrl.search = querystring.stringify(parseUrl.query);
    let urlSort = url.format(parseUrl);
    return urlSort;
  },
};
