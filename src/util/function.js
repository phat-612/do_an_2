require("dotenv").config();
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
    if (typeof objDiscount == "object") {
      let discount;
      if (
        Date.now() > objDiscount.startDay &&
        Date.now() < objDiscount.endDay
      ) {
        discount = objDiscount.percent;
      } else {
        discount = 0;
      }
      return discount;
    } else {
      return objDiscount;
    }
  },
  /**
   * dùng để lấy ra currentPage và totalPage của sản phẩm
   * @param {dataPagi:Array}  dataPagi là mảng chứa dữ liệu sản phẩm
   * @param {req:Object} req là object chứa thông tin request
   * @return {[currentPage:Number, totalPage:Number, countChild:Number]}
   */
  getDataPagination: (dataPagi, req) => {
    let countChild = dataPagi.length;
    let currentPage = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 16;
    let totalPage =
      countChild % limit === 0
        ? countChild / limit
        : Math.floor(countChild / limit) + 1;
    return [currentPage, totalPage, countChild];
  },
  findSimilarProduct: (Product, product) => {
    return Product.find({
      $or: [
        { category: product.category },
        {
          "variations.attributes": product.variations[0].attributes,
        },
      ],
    })
      .limit(10)
      .exec();
  },
};
