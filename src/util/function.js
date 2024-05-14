module.exports = {
  sortObject: (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  },
  /**
   * dùng để lấy ra giá trị giảm giá của sản phẩm dữ vào object discount
   * @param {Object} objDiscount
   * @return {Number}
   */
  getDiscount: (objDiscount) => {
    let discount;
    if (Date.now() > objDiscount.startDay && Date.now() < objDiscount.endDay) {
      discount = objDiscount.percent;
    } else {
      discount = 0;
    }
    return discount;
  },
};
