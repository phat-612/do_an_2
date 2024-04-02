const mongoose = require("mongoose");
const diacritics = require("diacritics");
const Schema = mongoose.Schema;
const Category = new Schema({
  name: String,
  slug: { type: String },
  idParent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
});
// helper function
Category.query.getCategory = function (name = null) {
  function getNestedChildren(arr, parent) {
    var children = [];
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i].idParent && arr[i].idParent.toString() === parent.toString()) {
        let childrenNodes = getNestedChildren(arr, arr[i]._id);
        if (childrenNodes.length) {
          arr[i].children = childrenNodes;
        }
        children.push(arr[i]);
      }
    }
    return children;
  }
  return getNestedChildren;
};
// tạo slug
Category.pre("validate", function (next) {
  if (this.name) {
    const nameWithoutAccent = diacritics.remove(this.name);
    let slug = nameWithoutAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slugRegEx = new RegExp(`^(${slug})((-[0-9]*$)?)$`, "i");
    console.log("regex: ", slugRegEx);
    this.constructor.find({ slug: slugRegEx }).then((categoriesWithSlug) => {
      console.log("categoriesWithSlug: ", categoriesWithSlug);
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
