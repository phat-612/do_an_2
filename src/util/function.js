module.exports = {
  sortObject: (object) => {
    return Object.keys(object)
      .sort()
      .reduce(function (acc, key) {
        acc[key] = object[key];
        return acc;
      }, {});
  },
};
