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
// tạo slug
Category.pre("validate", function (next) {
  if (this.name) {
    const nameWithoutAccent = diacritics.remove(this.name);
    let slug = nameWithoutAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slugRegEx = new RegExp(`^(${slug})((-[0-9]*$)?)$`, "i");
    this.constructor.find({ slug: slugRegEx }).then((categoriesWithSlug) => {
      if (categoriesWithSlug.length) {
        this.slug = `${slug}-${categoriesWithSlug.length + 1}`;
      } else {
        this.slug = slug;
      }
      next();
    });
  }
});
module.exports = mongoose.model("Category", Category);
