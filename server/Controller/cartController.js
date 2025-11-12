import CartItem from "../Model/cartModel.js";
import Product from "../Model/productModel.js"; // optional, if used in populate

const DEMO_USER = "guest";

function mapCartItems(items) {
  const mapped = items.map((item) => ({
    _id: item._id,
    productId: item.productId?._id || item.productId,
    name: item.name || item.productId?.name,
    image: item.image || item.productId?.image,
    price: item.price || item.productId?.price,
    qty: item.qty,
    subtotal: item.qty * (item.price || item.productId?.price || 0),
  }));

  const total = mapped.reduce((sum, i) => sum + i.subtotal, 0);

  return { items: mapped, total };
}

export const getCart = async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER;

    const items = await CartItem.find({ userId })
      .populate("productId")
      .lean()
      .exec();

    const { items: cartItems, total } = mapCartItems(items);

    return res.status(200).json({
      status: "success",
      message: "Cart fetched successfully",
      result: cartItems.length,
      data: { items: cartItems, total },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching cart",
      error: error.message,
    });
  }
};


export const upsertCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    if (!productId || qty == null) {
      return res.status(400).json({
        status: "fail",
        message: "Product ID and quantity are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const DEMO_USER = "guest";

    if (qty === 0) {
      await CartItem.deleteOne({ userId: DEMO_USER, productId });
    } else {
      await CartItem.findOneAndUpdate(
        { userId: DEMO_USER, productId },
        {
          productId,
          name: product.name,
          price: product.price,
          image: product.image,
          qty,
        },
        { upsert: true, new: true }
      );
    }

    const items = await CartItem.find({ userId: DEMO_USER });
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      data: { items, total },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update cart",
      error: error.message,
    });
  }
};


export const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid cart item ID",
      });
    }

    await CartItem.findByIdAndDelete(id);

    const items = await CartItem.find({ userId: DEMO_USER })
      .populate("productId")
      .lean()
      .exec();
    const { items: cartItems, total } = mapCartItems(items);

    return res.status(200).json({
      status: "success",
      message: "Cart item deleted successfully",
      result: cartItems.length,
      data: { items: cartItems, total },
    });
  } catch (error) {

    return res.status(500).json({
      status: "error",
      message: "Error deleting cart item",
      error: error.message,
    });
  }
};


export const checkoutCart = async (req, res) => {
  try {

    const { name, email } = req.body;
    const items = await CartItem.find({ userId: DEMO_USER })
      .populate("productId")
      .lean()
      .exec();

    const total = items.reduce(
      (sum, i) => sum + i.productId.price * i.qty,
      0
    );

    const receipt = {
      receiptId: "rcpt_" + Math.random().toString(36).slice(2, 10),
      name,
      email,
      total,
      totalFormatted: "$" + (total / 100).toFixed(2),
      timestamp: new Date().toISOString(),
    };

    // Clear cart
    await CartItem.deleteMany({ userId: DEMO_USER });

    return res.status(200).json({
      status: "success",
      message: "Checkout completed successfully",
      data: receipt,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Checkout failed",
      error: error.message,
    });
  }
};