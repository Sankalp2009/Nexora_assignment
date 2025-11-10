import express from "express";
import * as CartController from "../Controller/cartController.js";

const router = express.Router();

router
  .route("/")
  .get(CartController.getCart)       
  .post(CartController.upsertCart); 


router
  .route("/:id")
  .delete(CartController.deleteCartItem);


router
  .route("/checkout")
  .post(CartController.checkoutCart);

export default router;
