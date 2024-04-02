const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = new Schema(
  {
    name: { type: String },
    description: { type: String },
    images: [String],
    slug: { type: String },
    idCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    variations: [
      {
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
