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
    idCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    variations: [
      {
        slug: { type: String },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        attributes: { type: Object },
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
Product.query.sortable = function (req) {
  if (req.query.hasOwnProperty("_sort")) {
    const isValidType = ["asc", "desc"].includes(req.query.type);
    return this.sort({
      [req.query.column]: isValidType ? req.query.type : "desc",
    });
  }
  return this;
};
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
    const nameWithoutAccent = diacritics.remove(attributesString);
    variation.slug = slugify(nameWithoutAccent, { lower: true, strict: true });
  });
  next();
});
Product.pre("validate", function (next) {
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
module.exports = mongoose.model("Product", Product);
