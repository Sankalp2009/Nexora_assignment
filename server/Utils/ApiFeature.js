class ApiFeature {
  constructor(findQuery, queryString) {
    this.findQuery = findQuery;
    this.queryString = queryString;
  }

  search() {
    const { search } = this.queryString;
    if (search) {
      const trimmed = search.trim();

      // Always use regex search
      this.findQuery = this.findQuery.find({
        $or: [
          { name: new RegExp(trimmed, "i") },
          { description: new RegExp(trimmed, "i") },
          { category: new RegExp(trimmed, "i") },
          { brand: new RegExp(trimmed, "i") },
        ],
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ["page", "sort", "limit", "fields", "search"];
    excluded.forEach((field) => delete queryObj[field]);

    if (queryObj.category) {
      queryObj.category = { $in: [].concat(queryObj.category) };
    }

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (m) => `${m}`
    );

    this.findQuery = this.findQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    const { sort } = this.queryString;
    this.findQuery = sort
      ? this.findQuery.sort(sort.split(",").join(" "))
      : this.findQuery.sort("-createdAt");
    return this;
  }

  limitFields() {
    const { fields } = this.queryString;
    this.findQuery = fields
      ? this.findQuery.select(fields.split(",").join(" "))
      : this.findQuery.select("-__v");
    return this;
  }

  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page) || 1);
    const limit = Math.max(1, parseInt(this.queryString.limit) || 10);
    const skip = (page - 1) * limit;

    this.findQuery = this.findQuery.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }

  // Helper method to get the current query filter (for counting)
  getQuery() {
    return this.findQuery.getQuery();
  }

  async exec() {
    return this.findQuery.lean().exec();
  }
}

export default ApiFeature;