const Handlebars = require("handlebars");
module.exports = {
  sum: (a, b) => a + b,
  hiddenSentence: (sentence) => sentence.replace(/[^\s]/g, "-"),
};
