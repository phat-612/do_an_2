const mongoose = require("mongoose");
const diacritics = require("diacritics");

//
const Product = require("./Product");
//

const Schema = mongoose.Schema;
const Category = new Schema({
  name: String,
  slug: { type: String },
  idParent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
});

// helper function
Category.statics.getCategoryChildren = async function (parentId = null) {
  const categories = await this.find({ idParent: parentId });
  return Promise.all(
    categories.map(async (category) => {
      const children = await this.getCategoryChildren(category._id);
      const categoryObj = category.toObject();
      categoryObj.children = children;
      return categoryObj;
    })
  );
};
// lấy tất cả sản phẩm trong 1 danh mục
Category.statics.getArrayChidrendIds = async function (categoryId = null) {
  let categoryIds = [];
  const findChildren = async (id) => {
    categoryIds.push(id);
    const categories = await this.find({ idParent: id });
    for (let cat of categories) {
      await findChildren(cat._id);
    }
  };

  await findChildren(categoryId);
  return categoryIds.filter((id) => id !== null);
};

// tìm theo tên danh mục
Category.statics.findByName = function (name) {
  return this.find({ name: new RegExp(name, "i") });
};
// page navigation
Category.query.paginate = function (req) {
  let page = parseInt(req.query.page) || 1;
  page = page <= 0 ? 1 : page;

  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  return this.skip(skip).limit(limit);
};
module.exports = mongoose.model("Category", Category);
