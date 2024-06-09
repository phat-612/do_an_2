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
  getDataPagination: (dataPagi, req, limit = 16) => {
    let countChild = dataPagi.length;
    let currentPage = parseInt(req.query.page) || 1;
    limit = parseInt(req.query.limit) || limit;
    let totalPage =
      countChild % limit === 0
        ? countChild / limit
        : Math.floor(countChild / limit) + 1;
    return [currentPage, totalPage, countChild];
  },
  findSimilarProduct: async (Product, product, Category) => {
    let similarProductsChildren = [];
    let similarProducts = await Product.find({
      idCategory: product.idCategory,
      isBusiness: true,
    })
      .limit(10)
      .exec();
    if (similarProducts.length < 10) {
      let category = await Category.findOne({ _id: product.idCategory });
      let categoryChildren = await Category.getArrayChidrendIds(
        category.idParent
      );

      categoryChildren = categoryChildren.filter(
        (id) => id.toString() !== product.idCategory.toString()
      );
      similarProductsChildren = await Product.find({
        idCategory: { $in: categoryChildren },
        isBusiness: true,
      })
        .limit(10 - similarProducts.length)
        .exec();
    }
    return [...similarProducts, ...similarProductsChildren];
  },
  findFinalIdCategory: async (Category, arrSlug, rootCategory) => {
    arrSlug.unshift(rootCategory);
    let idCategory;
    for (let i = 0; i < arrSlug.length; i++) {
      let category = await Category.findOne({
        slug: arrSlug[i],
        idParent: idCategory,
      });
      if (category) {
        idCategory = category._id;
      } else {
        return false;
      }
    }
    return idCategory;
  },
};
