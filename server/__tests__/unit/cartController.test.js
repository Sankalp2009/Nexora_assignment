import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import CartItem from '../../Model/cartModel.js';
import Product from '../../Model/productModel.js';
import { getCart, upsertCart, deleteCartItem, checkoutCart } from '../../Controller/cartController.js';
import {jest} from '@jest/globals';
describe('Cart Controller Tests', () => {
  let mockReq, mockRes, testProduct;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product',
      price: 2999,
      category: 'electronics',
      image: 'https://example.com/image.jpg',
    });

    // Setup mock request and response
    mockReq = {
      query: {},
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getCart', () => {
    test('should return empty cart for new user', async () => {
      mockReq.query.userId = 'guest';

      await getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Cart fetched successfully',
        result: 0,
        data: { items: [], total: 0 },
      });
    });

    test('should return cart items with calculated totals', async () => {
      // Add items to cart
      await CartItem.create({
        userId: 'guest',
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        qty: 2,
        image: testProduct.image,
      });

      mockReq.query.userId = 'guest';

      await getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.result).toBe(1);
      expect(response.data.items[0].qty).toBe(2);
      expect(response.data.total).toBe(5998);
    });

    test('should handle database errors gracefully', async () => {
      jest.spyOn(CartItem, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Internal server error while fetching cart',
        })
      );
    });
  });

  describe('upsertCart', () => {
    test('should add new item to cart', async () => {
      mockReq.body = {
        productId: testProduct._id.toString(),
        qty: 3,
      };

      await upsertCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.data.items).toHaveLength(1);
      expect(response.data.items[0].qty).toBe(3);
    });

    test('should update existing cart item quantity', async () => {
      // Add initial item
      await CartItem.create({
        userId: 'guest',
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        qty: 1,
        image: testProduct.image,
      });

      mockReq.body = {
        productId: testProduct._id.toString(),
        qty: 5,
      };

      await upsertCart(mockReq, mockRes);

      const cartItems = await CartItem.find({ userId: 'guest' });
      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].qty).toBe(5);
    });

    test('should remove item when quantity is 0', async () => {
      await CartItem.create({
        userId: 'guest',
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        qty: 2,
        image: testProduct.image,
      });

      mockReq.body = {
        productId: testProduct._id.toString(),
        qty: 0,
      };

      await upsertCart(mockReq, mockRes);

      const cartItems = await CartItem.find({ userId: 'guest' });
      expect(cartItems).toHaveLength(0);
    });

    test('should return 400 for missing productId', async () => {
      mockReq.body = { qty: 2 };

      await upsertCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Product ID and quantity are required',
      });
    });

    test('should return 404 for non-existent product', async () => {
      mockReq.body = {
        productId: '507f1f77bcf86cd799439011',
        qty: 1,
      };

      await upsertCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });
  });

  describe('deleteCartItem', () => {
    test('should delete cart item by id', async () => {
      const cartItem = await CartItem.create({
        userId: 'guest',
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        qty: 1,
        image: testProduct.image,
      });

      mockReq.params.id = cartItem._id.toString();

      await deleteCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.message).toBe('Cart item deleted successfully');

      const remainingItems = await CartItem.find({ userId: 'guest' });
      expect(remainingItems).toHaveLength(0);
    });

    test('should return 400 for invalid cart item id', async () => {
      mockReq.params.id = '';

      await deleteCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid cart item ID',
      });
    });

    test('should handle non-existent cart item gracefully', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';

      await deleteCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        })
      );
    });
  });

  describe('checkoutCart', () => {
    test('should complete checkout and return receipt', async () => {
      await CartItem.create({
        userId: 'guest',
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        qty: 2,
        image: testProduct.image,
      });

      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      await checkoutCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.data.name).toBe('John Doe');
      expect(response.data.email).toBe('john@example.com');
      expect(response.data.receiptId).toMatch(/^rcpt_/);
      expect(response.data.total).toBe(5998);

      // Verify cart is cleared
      const cartItems = await CartItem.find({ userId: 'guest' });
      expect(cartItems).toHaveLength(0);
    });

    test('should handle empty cart checkout', async () => {
      mockReq.body = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      await checkoutCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.total).toBe(0);
    });

    test('should handle checkout errors', async () => {
      jest.spyOn(CartItem, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
      };

      await checkoutCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Checkout failed',
        })
      );
    });
  });
});