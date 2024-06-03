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
  or: (...args) => args.some((arg) => arg),
  and: (...args) => args.every((arg) => arg),
  concat: (...args) => args.slice(0, -1).join(""),
  objectToLi: (object) => {
    let outputString = "";
    Object.keys(object).forEach((key, index) => {
      outputString += `<li>${key}: ${object[key]}</li>`;
    });
    return outputString;
  },
  mathHandle: (val1, operator, val2) => {
    val1 = parseFloat(val1);
    val2 = parseFloat(val2);
    return {
      "+": val1 + val2,
      "-": val1 - val2,
      "*": val1 * val2,
      "/": val1 / val2,
      "%": val1 % val2,
    }[operator];
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
      case "fixing":
        return "Đang sửa chữa";
      case "paid":
        return "Đã trả";
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
  showTagBusiness: (isBusiness) => {
    if (!isBusiness) {
      return `<p
                class="position-absolute bg-danger p-1 text-white rounded-end-5 z-3"
              >Ngừng kinh doanh</p>`;
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
    <p class="invisible">d</p>
      <p class="card-text text-danger fs-4 fw-medium">
        ${price.toLocaleString("vi-VN")}
      </p>`;
  },
  showVariations: (variations, curVariation, discount) => {
    let outputHtml = "";
    variations.forEach((variation, ind) => {
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
                slug == curVariation.slug ? "border-danger" : ""
              } rounded position-relative"
              role="button"
            >
              ${
                variation[key].quantity == 0 && ind == variations.length - 1
                  ? `
                  <p class="position-absolute bg-danger p-1 text-white rounded-end-5 z-3 start-0 top-0">
                    Hết hàng
                  </p>
                `
                  : ""
              }
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
  showOverviewReivews: (reviews) => {
    let avageRating =
      reviews.reduce((acc, review) => {
        return acc + review.rating;
      }, 0) / reviews.length;
    if (isNaN(avageRating)) {
      avageRating = 0;
    } else {
      avageRating = avageRating.toFixed(1);
    }
    let starReivews = {};
    for (let i = 1; i <= 5; i++) {
      starReivews[i] = reviews.filter((review) => review.rating == i).length;
    }
    let details = "";
    Object.keys(starReivews).forEach((key) => {
      details += `
              <div class="row px-0 align-items-center">
                <span class="col-2">${key}<span class="fa fa-star text-warning"></span></span>
                <div class="progress col px-0">
                  <div class="progress-bar" role="progressbar" style="width: ${
                    (starReivews[key] / reviews.length) * 100
                  }%" aria-valuenow="" aria-valuemin="0"
                    aria-valuemax="100"></div>
                </div>
                <span class="col-3 px-0 text-end">${
                  starReivews[key]
                } đánh giá</span>
              </div>
      `;
    });
    return `
      <div class="col-4 justify-content-center align-items-center d-flex flex-column">
              <p class="fw-bold fs-4">
                ${avageRating}/5
              </p>
              <div>
                <span class="fa fa-star text-warning"></span>
                <span class="fa fa-star text-warning"></span>
                <span class="fa fa-star text-warning"></span>
                <span class="fa fa-star text-warning"></span>
                <span class="fa fa-star text-warning"></span>
              </div>
              <p>${reviews.length} đánh giá</p>
            </div>
            <div class="col-8 ">
              ${details}
            </div>
    `;
  },
  showReviews: (reviews) => {
    let outputHtml = "";
    reviews.forEach((review) => {
      let star = "";
      for (let i = 0; i < 5; i++) {
        star += `<span class="fa fa-star ${
          i < review.rating ? "text-warning" : ""
        }"></span>`;
      }
      outputHtml += `<div>
                      <div class="text-capitalize">
                      <button class="rounded-circle bg-danger text-white border-0 py-2 px-3 text-uppercase">${
                        review.idUser.name[0]
                      }</button>
                     <span class="fw-bold"> ${
                       review.idUser.name
                     }</span> <span class="opacity-50">   ${moment(
        review.time
      ).format("DD/MM/YYYY HH:mm")}</span></div>
                      <div class="ms-5">
                        <div>
                          ${star}
                        </div>
                        <div class=" text-break">${review.comment}</div>
                      </div>
                    </div>`;
    });
    return outputHtml;
  },
  showRatingStar: (reviews) => {
    let aveRating =
      reviews.reduce((acc, cur) => {
        return acc + cur.rating;
      }, 0) / reviews.length;

    if (isNaN(aveRating)) {
      aveRating = 0;
    } else {
      aveRating = Math.round(aveRating);
    }
    let outputHtml = `<div class="ratings">`;
    for (let i = 0; i < 5; i++) {
      outputHtml +=
        i < aveRating
          ? `<i class="fa fa-star text-warning"></i>`
          : `<i class="fa fa-star"></i>`;
    }
    outputHtml += `</div>`;
    return outputHtml;
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
    const brands = categories.find(
      (category) => category.slug == rootCategory.slug
    );
    if (brands) {
      return brands.children.map((brand) => ({
        name: brand.name,
        slug: brand.slug,
      }));
    }
  },
  getSoldOutOrBusiness: (isBusiness, quantity) => {
    let outputText = "";
    if (quantity == 0) {
      outputText = "Hết hàng";
    }
    if (!isBusiness) {
      outputText = "Ngừng kinh doanh";
    }
    return outputText;
  },
  // chuyển đổi thành chuỗi
  printObject: (object) => {
    return new Handlebars.SafeString(JSON.stringify(object, null, 2));
  },
  statusToast: (type) => {
    if (type == "success") {
      return "bg-success";
    } else if (type == "danger") {
      return "bg-danger";
    }
    return "";
  },
  navActive: (currentPath, path) => {},
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
  isBtnCancelOrder: (statusOrder, statusPayment) => {
    if (statusOrder == "pending" && statusPayment != "success") {
      return true;
    }
    return false;
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
  statusWarranty: (currentStatus, compareStatus) => {
    return currentStatus === compareStatus;
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

  createHiddenInput: (attributes, index) => {
    let htmlinputHidden = ``;
    Object.keys(attributes).forEach((key, ind) => {
      htmlinputHidden += `
      <input type="text"
      name="variations[${index}][attributes][${key}]"
      value="${attributes[key]}" hidden>
      `;
    });

    return htmlinputHidden;
  },
  getAttri2name: (attributes) => {
    let count = 0;
    let name = [];
    Object.keys(attributes).forEach((key, ind) => {
      count++;
      name.push(key);
    });
    if (count == 1) {
      return "";
    } else {
      return name[1];
    }
  },
};
