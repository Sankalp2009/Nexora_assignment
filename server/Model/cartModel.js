import mongoose from "mongoose";

const { Schema } = mongoose;

const CartItemSchema = new Schema({
  userId: { type: String, default: 'guest' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  qty: { type: Number, required: true, min: 1 },
  image: String,
},
{
    timestamps: true,
    versionKey: false,
});

const CartItem = mongoose.model('CartItem', CartItemSchema);

export default CartItem;