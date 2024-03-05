module.exports = {
  multipleMongooseToObject: function (mongooses) {
    if (!mongooses) return [];
    return mongooses.map((mongoose) => mongoose.toObject());
  },
  mongooseToObject: function (mongoose) {
    if (!mongoose) return {};
    return mongoose ? mongoose.toObject() : mongoose;
  },
};
