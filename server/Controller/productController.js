import Product from "../Model/productModel.js";
import ApiFeature from "../Utils/ApiFeature.js";

export const getAllProduct = async (req, res) => {
  try {
    // Validate and sanitize pagination parameters
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

    // Build the base query with ApiFeature
    const features = new ApiFeature(Product.find(), req.query)
      .search()
      .filter()
      .sort()
      .limitFields();

    // Get the filter for counting total documents
    const filterQuery = features.findQuery.getQuery();

    // Count total documents matching the filter (before pagination)
    const totalCount = await Product.countDocuments(filterQuery);

    // Apply pagination
    features.paginate();

    // Execute the query
    const products = await features.exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: "success",
      result: products.length,
      totalCount,
      totalPages,
      currentPage: page,
      message: products.length > 0 ? "List of all products" : "No products found",
      data: products,
    });
  } catch (err) {
    console.error("getAllProduct error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: err.message,
    });
  }
};