jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URI = 'mongodb://localhost:27017/test';

// Global test utilities
global.testUtils = {
  createMockReq: (overrides = {}) => ({
    query: {},
    body: {},
    params: {},
    ...overrides,
  }),
  
  createMockRes: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },
};

// Cleanup after all tests
afterAll(async () => {
  // Give time for async operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
});