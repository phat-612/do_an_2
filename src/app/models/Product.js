const mongoose = require("mongoose");
const diacritics = require("diacritics");
const slugify = require("slugify");
const Schema = mongoose.Schema;
const Product = new Schema(
  {
    name: { type: String },
    description: { type: String },
    images: [String],
    view: { type: Number, default: 0 },
    slug: { type: String },
    isbusiness: { type: Boolean, default: true },
    idCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    variations: [
      {
        slug: { type: String },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        attributes: { type: Object },
        sold: { type: Number, default: 0 },
      },
    ],
    discount: {
      percent: { type: Number, default: 0 },
      startDay: { type: Date },
      endDay: { type: Date },
    },
  },
  { timestamps: true }
);
// sortable
// page navigation
Product.query.paginate = function (req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 16;
  const skip = (page - 1) * limit;
  return this.skip(skip).limit(limit);
};
// findable
Product.query.findable = function (req) {
  if (req.query.hasOwnProperty("_find")) {
    let searchQuery = req.query.q;
    let words = searchQuery.split(" ");

    let regexWords = words.map((word) => ({
      name: { $regex: word, $options: "i" },
    }));

    return this.find({
      $and: regexWords,
    });
  }
  return this;
};
Product.pre("save", function (next) {
  this.variations.forEach((variation) => {
    let attributesString = Object.values(variation.attributes).join(" ");
    const nameWithoutAccent = diacritics.remove(attributesString).trim();
    variation.slug = slugify(nameWithoutAccent, { lower: true, strict: true });
  });
  next();
});
Product.pre("validate", function (next) {
  if (this.name) {
    const nameWithoutAccent = diacritics.remove(this.name).trim();
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
module.exports = mongoose.model("Product", Product);
