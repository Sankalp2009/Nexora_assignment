import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import Product from '../../Model/productModel.js';
import { getAllProduct } from '../../Controller/productController.js';
import {jest} from '@jest/globals';

describe('Product Controller Tests', () => {
  let mockReq, mockRes;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Seed test products
    await Product.insertMany([
      {
        name: 'iPhone 14 Pro',
        price: 99999,
        category: 'electronics',
        image: 'https://example.com/iphone.jpg',
      },
      {
        name: 'Samsung Galaxy S23',
        price: 79999,
        category: 'electronics',
        image: 'https://example.com/samsung.jpg',
      },
      {
        name: 'Nike Air Max',
        price: 8999,
        category: 'shoes',
        image: 'https://example.com/nike.jpg',
      },
      {
        name: 'Adidas Ultraboost',
        price: 12999,
        category: 'shoes',
        image: 'https://example.com/adidas.jpg',
      },
      {
        name: 'Leather Jacket',
        price: 15999,
        category: 'clothing',
        image: 'https://example.com/jacket.jpg',
      },
    ]);

    mockReq = {
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllProduct', () => {
    test('should return all products with default pagination', async () => {
      await getAllProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.result).toBe(5);
      expect(response.totalCount).toBe(5);
      expect(response.totalPages).toBe(1);
      expect(response.currentPage).toBe(1);
      expect(response.data).toHaveLength(5);
    });

    test('should handle pagination correctly', async () => {
      mockReq.query = {
        page: '2',
        limit: '2',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBeLessThanOrEqual(2);
      expect(response.currentPage).toBe(2);
      expect(response.totalPages).toBe(3);
    });

    test('should filter by category', async () => {
      mockReq.query = {
        category: 'electronics',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBe(2);
      expect(response.data.every(p => p.category === 'electronics')).toBe(true);
    });

    test('should search by product name', async () => {
      mockReq.query = {
        search: 'iPhone',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBeGreaterThan(0);
      expect(response.data[0].name).toContain('iPhone');
    });

    test('should sort products by price ascending', async () => {
      mockReq.query = {
        sort: 'price',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const prices = response.data.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('should sort products by price descending', async () => {
      mockReq.query = {
        sort: '-price',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const prices = response.data.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test('should filter by price range (gte)', async () => {
      mockReq.query = {
        'price[gte]': '10000',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.every(p => p.price >= 10000)).toBe(true);
    });

    test('should filter by price range (lte)', async () => {
      mockReq.query = {
        'price[lte]': '10000',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.every(p => p.price <= 10000)).toBe(true);
    });

    test('should handle combined filters and sorting', async () => {
      mockReq.query = {
        category: 'electronics',
        sort: '-price',
        limit: '1',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBe(1);
      expect(response.data[0].category).toBe('electronics');
      expect(response.data[0].name).toContain('iPhone');
    });

    test('should return empty array when no products match', async () => {
      mockReq.query = {
        category: 'non-existent-category',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.result).toBe(0);
      expect(response.data).toEqual([]);
      expect(response.message).toBe('No products found');
    });

    test('should sanitize invalid page numbers', async () => {
      mockReq.query = {
        page: '-5',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.currentPage).toBe(1);
    });

    test('should cap limit to maximum value', async () => {
      mockReq.query = {
        limit: '1000',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBeLessThanOrEqual(100);
    });

    test('should handle invalid query parameters gracefully', async () => {
      mockReq.query = {
        page: 'invalid',
        limit: 'abc',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.currentPage).toBe(1);
    });

    test('should return correct total pages calculation', async () => {
      mockReq.query = {
        limit: '2',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.totalPages).toBe(Math.ceil(5 / 2));
    });

    test('should search across multiple fields', async () => {
      mockReq.query = {
        search: 'shoes',
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBeGreaterThan(0);
    });

    test('should handle multiple categories', async () => {
      mockReq.query = {
        category: ['electronics', 'shoes'],
      };

      await getAllProduct(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.result).toBe(4);
      expect(
        response.data.every(p => 
          p.category === 'electronics' || p.category === 'shoes'
        )
      ).toBe(true);
    });
  });
});

