import Product from "../Model/productModel.js";
import ApiFeature from "../Utils/ApiFeature.js";
import mongoose from "mongoose";

export const getAllProduct = async (req, res) => {
  try {
    // Validate and sanitize pagination parameters
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 10; // limit max 100 to avoid large queries

    // Initialize ApiFeature with a base aggregation pipeline array
    // We'll build aggregation stages for search, filter, sort, and pagination
    // ApiFeature currently works with find queries, so we need to adapt or replicate its logic for aggregation

    // Since ApiFeature is designed for find queries, let's extract the filter, sort, and search criteria from it
    // Then build aggregation pipeline accordingly

    // Create an instance of ApiFeature with a dummy find query to get filters and options
    const features = new ApiFeature(Product.find().lean(), req.query)
      .search()
      .filter()
      .sort();

    // Extract filter object and sort object from features
    const filter = features.findQuery.getFilter();
    const sort = features.sortBy || {};

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage for filter and search
    pipeline.push({ $match: filter });

    // Sort stage
    if (Object.keys(sort).length > 0) {
      pipeline.push({ $sort: sort });
    }

    // Facet stage to get paginated results and total count in one query
    pipeline.push({
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });

    // Execute aggregation
    const aggResult = await Product.aggregate(pipeline).exec();

    // aggResult is an array with one element containing data and totalCount arrays
    const products = aggResult[0]?.data || [];
    const totalCount = aggResult[0]?.totalCount[0]?.count || 0;

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