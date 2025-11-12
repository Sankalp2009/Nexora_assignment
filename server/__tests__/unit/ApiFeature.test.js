import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import Product from '../../Model/productModel.js';
import ApiFeature from '../../Utils/ApiFeature.js';
import jest from "jest";
describe('ApiFeature Utility Tests', () => {
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
      { name: 'Laptop Pro', price: 150000, category: 'electronics', image: 'laptop.jpg' },
      { name: 'Gaming Mouse', price: 5000, category: 'electronics', image: 'mouse.jpg' },
      { name: 'Running Shoes', price: 8000, category: 'sports', image: 'shoes.jpg' },
      { name: 'Yoga Mat', price: 2000, category: 'sports', image: 'mat.jpg' },
      { name: 'T-Shirt', price: 1500, category: 'clothing', image: 'tshirt.jpg' },
    ]);
  });

  describe('search()', () => {
    test('should search products by name', async () => {
      const query = { search: 'Laptop' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.search().exec();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Laptop');
    });

    test('should handle empty search term', async () => {
      const query = { search: '' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.search().exec();

      expect(results.length).toBe(5);
    });

    test('should handle whitespace in search', async () => {
      const query = { search: '  Laptop  ' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.search().exec();

      expect(results.length).toBeGreaterThan(0);
    });

    test('should search across multiple fields', async () => {
      const query = { search: 'sports' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.search().exec();

      expect(results.length).toBe(2);
    });

    test('should be case-insensitive', async () => {
      const query = { search: 'LAPTOP' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.search().exec();

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('filter()', () => {
    test('should filter by category', async () => {
      const query = { category: 'electronics' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.length).toBe(2);
      expect(results.every(p => p.category === 'electronics')).toBe(true);
    });

    test('should filter by multiple categories', async () => {
      const query = { category: ['electronics', 'sports'] };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.length).toBe(4);
    });

    test('should filter by price range using gte', async () => {
      const query = { 'price[gte]': 5000 };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.every(p => p.price >= 5000)).toBe(true);
    });

    test('should filter by price range using lte', async () => {
      const query = { 'price[lte]': 5000 };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.every(p => p.price <= 5000)).toBe(true);
    });

    test('should filter by price range using gt', async () => {
      const query = { 'price[gt]': 5000 };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.every(p => p.price > 5000)).toBe(true);
    });

    test('should filter by price range using lt', async () => {
      const query = { 'price[lt]': 5000 };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.every(p => p.price < 5000)).toBe(true);
    });

    test('should exclude reserved query parameters', async () => {
      const query = { 
        category: 'electronics',
        page: 1,
        sort: 'price',
        limit: 10,
        fields: 'name,price',
        search: 'laptop'
      };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.every(p => p.category === 'electronics')).toBe(true);
    });
  });

  describe('sort()', () => {
    test('should sort by price ascending', async () => {
      const query = { sort: 'price' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.sort().exec();

      const prices = results.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('should sort by price descending', async () => {
      const query = { sort: '-price' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.sort().exec();

      const prices = results.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test('should sort by name ascending', async () => {
      const query = { sort: 'name' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.sort().exec();

      const names = results.map(p => p.name);
      expect(names).toEqual([...names].sort());
    });

    test('should use default sort by createdAt', async () => {
      const query = {};
      const features = new ApiFeature(Product.find(), query);
      const results = await features.sort().exec();

      expect(results.length).toBe(5);
    });

    test('should sort by multiple fields', async () => {
      const query = { sort: 'category,price' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.sort().exec();

      expect(results.length).toBe(5);
    });
  });

  describe('limitFields()', () => {
    test('should select specific fields', async () => {
      const query = { fields: 'name,price' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.limitFields().exec();

      expect(results[0]).toHaveProperty('name');
      expect(results[0]).toHaveProperty('price');
      expect(results[0]).not.toHaveProperty('__v');
    });

    test('should exclude __v by default', async () => {
      const query = {};
      const features = new ApiFeature(Product.find(), query);
      const results = await features.limitFields().exec();

      expect(results[0]).not.toHaveProperty('__v');
    });

    test('should handle multiple fields', async () => {
      const query = { fields: 'name,price,category' };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.limitFields().exec();

      expect(results[0]).toHaveProperty('name');
      expect(results[0]).toHaveProperty('price');
      expect(results[0]).toHaveProperty('category');
    });
  });

  describe('paginate()', () => {
    test('should paginate results', async () => {
      const query = { page: 1, limit: 2 };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.paginate().exec();

      expect(results.length).toBe(2);
    });

    test('should handle page 2', async () => {
      const query = { page: 2, limit: 2 };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.paginate().exec();

      expect(results.length).toBe(2);
    });

    test('should use default page 1', async () => {
      const query = { limit: 3 };
      const features = new ApiFeature(Product.find(), query);
      features.paginate();

      expect(features.page).toBe(1);
    });

    test('should use default limit 10', async () => {
      const query = { page: 1 };
      const features = new ApiFeature(Product.find(), query);
      features.paginate();

      expect(features.limit).toBe(10);
    });

    test('should handle invalid page numbers', async () => {
      const query = { page: -5, limit: 2 };
      const features = new ApiFeature(Product.find(), query);
      features.paginate();

      expect(features.page).toBe(1);
    });

    test('should handle invalid limit', async () => {
      const query = { page: 1, limit: -5 };
      const features = new ApiFeature(Product.find(), query);
      features.paginate();

      expect(features.limit).toBe(1);
    });
  });

  describe('Chaining methods', () => {
    test('should chain search, filter, and sort', async () => {
      const query = {
        search: 'shoes',
        category: 'sports',
        sort: '-price',
      };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.search().filter().sort().exec();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('sports');
    });

    test('should chain all methods', async () => {
      const query = {
        search: 'laptop',
        category: 'electronics',
        sort: 'price',
        fields: 'name,price',
        page: 1,
        limit: 5,
      };
      const features = new ApiFeature(Product.find(), query);
      const results = await features
        .search()
        .filter()
        .sort()
        .limitFields()
        .paginate()
        .exec();

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle empty results after filtering', async () => {
      const query = {
        category: 'nonexistent',
      };
      const features = new ApiFeature(Product.find(), query);
      const results = await features.filter().exec();

      expect(results.length).toBe(0);
    });
  });
});