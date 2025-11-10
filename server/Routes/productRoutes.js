import express from "express";
import * as ProductController from "../Controller/productController.js";

//This Way is destructured, we can also do it.
// const {getAllTours,getToursById,createTours,updateTours,deleteTours} = require('../controllers/toursController');
const router = express.Router(); //MiddleWare router

router
  .route("/")
  .get(ProductController.getAllProduct)

export default router;