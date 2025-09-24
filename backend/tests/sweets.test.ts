import request from 'supertest';
import app from '../src/index';

// Mock database operations to avoid database dependency in unit tests
jest.mock('../src/models/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  testConnection: jest.fn().mockResolvedValue(true),
}));

// Mock JWT utilities for authentication testing
jest.mock('../src/utils/auth', () => ({
  JWTUtils: {
    verifyToken: jest.fn((token) => {
      // Mock token verification for testing
      if (token && token.includes('mock-signature')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            return {
              userId: payload.userId,
              userRole: payload.userRole
            };
          } catch {
            return null;
          }
        }
      }
      return null;
    }),
    generateToken: jest.fn((userId, userRole) => {
      const payload = { userId, userRole, exp: Math.floor(Date.now() / 1000) + 3600 };
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const body = Buffer.from(JSON.stringify(payload)).toString('base64');
      return `${header}.${body}.mock-signature`;
    })
  },
  PasswordUtils: {
    hashPassword: jest.fn((password) => Promise.resolve(`hashed-${password}`)),
    comparePassword: jest.fn((password, hash) => Promise.resolve(hash === `hashed-${password}`))
  }
}));

// Mock sweet service with in-memory storage for tests
const mockSweets: any[] = [];
let sweetIdCounter = 1;

jest.mock('../src/utils/sweetService', () => ({
  SweetService: {
    getAllSweets: jest.fn((page = 1, limit = 20) => {
      const start = (page - 1) * limit;
      const end = start + limit;
      return Promise.resolve(mockSweets.slice(start, end));
    }),
    
    getSweetById: jest.fn((id) => {
      const sweet = mockSweets.find(s => s.id === id);
      return Promise.resolve(sweet || null);
    }),
    
    createSweet: jest.fn((sweetData) => {
      const newSweet = {
        id: `sweet-${sweetIdCounter++}`,
        ...sweetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSweets.push(newSweet);
      return Promise.resolve(newSweet);
    }),
    
    updateSweet: jest.fn((id, updateData) => {
      const sweetIndex = mockSweets.findIndex(s => s.id === id);
      if (sweetIndex === -1) return Promise.resolve(null);
      
      const updatedSweet = {
        ...mockSweets[sweetIndex],
        ...updateData,
        updatedAt: new Date(),
      };
      mockSweets[sweetIndex] = updatedSweet;
      return Promise.resolve(updatedSweet);
    }),
    
    deleteSweet: jest.fn((id) => {
      const sweetIndex = mockSweets.findIndex(s => s.id === id);
      if (sweetIndex === -1) return Promise.resolve(false);
      
      mockSweets.splice(sweetIndex, 1);
      return Promise.resolve(true);
    }),
    
    searchSweets: jest.fn((query) => {
      let filteredSweets = [...mockSweets];
      
      if (query.name) {
        filteredSweets = filteredSweets.filter(s => 
          s.name.toLowerCase().includes(query.name.toLowerCase())
        );
      }
      
      if (query.category) {
        filteredSweets = filteredSweets.filter(s => 
          s.category.toLowerCase().includes(query.category.toLowerCase())
        );
      }
      
      if (query.minPrice !== undefined) {
        filteredSweets = filteredSweets.filter(s => 
          parseFloat(s.price) >= query.minPrice
        );
      }
      
      if (query.maxPrice !== undefined) {
        filteredSweets = filteredSweets.filter(s => 
          parseFloat(s.price) <= query.maxPrice
        );
      }
      
      const page = query.page || 1;
      const limit = query.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return Promise.resolve(filteredSweets.slice(start, end));
    }),
    
    getSweetsCount: jest.fn((query) => {
      let count = mockSweets.length;
      
      if (query) {
        let filteredSweets = [...mockSweets];
        
        if (query.name) {
          filteredSweets = filteredSweets.filter(s => 
            s.name.toLowerCase().includes(query.name.toLowerCase())
          );
        }
        
        if (query.category) {
          filteredSweets = filteredSweets.filter(s => 
            s.category.toLowerCase().includes(query.category.toLowerCase())
          );
        }
        
        if (query.minPrice !== undefined) {
          filteredSweets = filteredSweets.filter(s => 
            parseFloat(s.price) >= query.minPrice
          );
        }
        
        if (query.maxPrice !== undefined) {
          filteredSweets = filteredSweets.filter(s => 
            parseFloat(s.price) <= query.maxPrice
          );
        }
        
        count = filteredSweets.length;
      }
      
      return Promise.resolve(count);
    }),
  },
}));

// Mock user service for authentication
jest.mock('../src/utils/userService', () => ({
  UserService: {
    findUserById: jest.fn((id) => {
      if (id === 'admin-user-id') {
        return Promise.resolve({
          id: 'admin-user-id',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
        });
      }
      if (id === 'regular-user-id') {
        return Promise.resolve({
          id: 'regular-user-id',
          email: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
        });
      }
      return Promise.resolve(null);
    }),
  },
}));

// Helper function to create admin auth token
const createAdminToken = () => {
  const payload = {
    userId: 'admin-user-id',
    userRole: 'admin',
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock-signature';
  
  return `${header}.${body}.${signature}`;
};

// Helper function to create regular user auth token
const createUserToken = () => {
  const payload = {
    userId: 'regular-user-id',
    userRole: 'user',
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock-signature';
  
  return `${header}.${body}.${signature}`;
};

// Test setup
beforeEach(() => {
  // Clear mock sweets and reset counters before each test
  mockSweets.length = 0;
  sweetIdCounter = 1;
  jest.clearAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  jest.restoreAllMocks();
});

describe('Sweets CRUD Endpoints', () => {
  describe('GET /api/sweets', () => {
    it('should get all sweets without authentication', async () => {
      // Add some mock sweets
      mockSweets.push(
        {
          id: 'sweet-1',
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: '25.99',
          quantity: 10,
          description: 'Delicious chocolate cake',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sweet-2',
          name: 'Vanilla Cupcake',
          category: 'Cupcakes',
          price: '5.99',
          quantity: 20,
          description: 'Sweet vanilla cupcake',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name', 'Chocolate Cake');
      expect(response.body.data[1]).toHaveProperty('name', 'Vanilla Cupcake');
    });

    it('should handle pagination for sweets', async () => {
      // Add multiple mock sweets
      for (let i = 1; i <= 25; i++) {
        mockSweets.push({
          id: `sweet-${i}`,
          name: `Sweet ${i}`,
          category: 'Test',
          price: '10.00',
          quantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const response = await request(app)
        .get('/api/sweets?page=2&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 2);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should return empty array when no sweets exist', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/sweets/:id', () => {
    beforeEach(() => {
      mockSweets.push({
        id: 'test-sweet-id',
        name: 'Test Sweet',
        category: 'Test Category',
        price: '15.99',
        quantity: 5,
        description: 'A test sweet',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should get a sweet by ID', async () => {
      const response = await request(app)
        .get('/api/sweets/test-sweet-id')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 'test-sweet-id');
      expect(response.body.data).toHaveProperty('name', 'Test Sweet');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .get('/api/sweets/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Sweet not found');
    });
  });

  describe('POST /api/sweets', () => {
    const adminToken = createAdminToken();
    const userToken = createUserToken();

    it('should create a new sweet (admin only)', async () => {
      const sweetData = {
        name: 'New Chocolate Brownie',
        category: 'Brownies',
        price: 12.99,
        quantity: 15,
        description: 'Rich chocolate brownie',
        imageUrl: 'https://example.com/brownie.jpg',
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Sweet created successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', sweetData.name);
      expect(response.body.data).toHaveProperty('category', sweetData.category);
      expect(response.body.data).toHaveProperty('price', sweetData.price);
      expect(response.body.data).toHaveProperty('quantity', sweetData.quantity);
    });

    it('should not allow regular users to create sweets', async () => {
      const sweetData = {
        name: 'Unauthorized Sweet',
        category: 'Test',
        price: 10.00,
        quantity: 5,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Admin');
    });

    it('should require authentication to create sweets', async () => {
      const sweetData = {
        name: 'Unauthenticated Sweet',
        category: 'Test',
        price: 10.00,
        quantity: 5,
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('token');
    });

    it('should validate required fields when creating sweet', async () => {
      const invalidSweetData = {
        name: 'Invalid Sweet',
        // Missing required fields: category, price, quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSweetData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate price is a positive number', async () => {
      const invalidSweetData = {
        name: 'Invalid Price Sweet',
        category: 'Test',
        price: -5.00, // Invalid negative price
        quantity: 10,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSweetData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('price');
    });

    it('should validate quantity is a non-negative integer', async () => {
      const invalidSweetData = {
        name: 'Invalid Quantity Sweet',
        category: 'Test',
        price: 10.00,
        quantity: -1, // Invalid negative quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSweetData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('quantity');
    });
  });

  describe('PUT /api/sweets/:id', () => {
    const adminToken = createAdminToken();
    const userToken = createUserToken();

    beforeEach(() => {
      mockSweets.push({
        id: 'update-test-id',
        name: 'Original Sweet',
        category: 'Original Category',
        price: '20.00',
        quantity: 10,
        description: 'Original description',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should update a sweet (admin only)', async () => {
      const updateData = {
        name: 'Updated Sweet Name',
        price: 25.00,
        quantity: 15,
        description: 'Updated description',
      };

      const response = await request(app)
        .put('/api/sweets/update-test-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Sweet updated successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('price', updateData.price);
      expect(response.body.data).toHaveProperty('quantity', updateData.quantity);
      expect(response.body.data).toHaveProperty('category', 'Original Category'); // Should remain unchanged
    });

    it('should not allow regular users to update sweets', async () => {
      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await request(app)
        .put('/api/sweets/update-test-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Admin');
    });

    it('should require authentication to update sweets', async () => {
      const updateData = {
        name: 'Unauthenticated Update',
      };

      const response = await request(app)
        .put('/api/sweets/update-test-id')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('token');
    });

    it('should return 404 for non-existent sweet update', async () => {
      const updateData = {
        name: 'Update Non-existent',
      };

      const response = await request(app)
        .put('/api/sweets/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Sweet not found');
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        price: 'invalid-price', // Should be a number
        quantity: -1, // Should be non-negative
      };

      const response = await request(app)
        .put('/api/sweets/update-test-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    const adminToken = createAdminToken();
    const userToken = createUserToken();

    beforeEach(() => {
      mockSweets.push({
        id: 'delete-test-id',
        name: 'Sweet to Delete',
        category: 'Test Category',
        price: '15.00',
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should delete a sweet (admin only)', async () => {
      const response = await request(app)
        .delete('/api/sweets/delete-test-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Sweet deleted successfully');
    });

    it('should not allow regular users to delete sweets', async () => {
      const response = await request(app)
        .delete('/api/sweets/delete-test-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Admin');
    });

    it('should require authentication to delete sweets', async () => {
      const response = await request(app)
        .delete('/api/sweets/delete-test-id')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('token');
    });

    it('should return 404 for non-existent sweet deletion', async () => {
      const response = await request(app)
        .delete('/api/sweets/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Sweet not found');
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(() => {
      // Add diverse mock sweets for search testing
      mockSweets.push(
        {
          id: 'search-1',
          name: 'Chocolate Chip Cookie',
          category: 'Cookies',
          price: '3.99',
          quantity: 50,
          description: 'Classic chocolate chip cookie',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'search-2',
          name: 'Vanilla Cake',
          category: 'Cakes',
          price: '29.99',
          quantity: 5,
          description: 'Delicious vanilla cake',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'search-3',
          name: 'Chocolate Brownie',
          category: 'Brownies',
          price: '8.99',
          quantity: 20,
          description: 'Rich chocolate brownie',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'search-4',
          name: 'Sugar Cookie',
          category: 'Cookies',
          price: '2.99',
          quantity: 30,
          description: 'Sweet sugar cookie',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toContain('Chocolate');
      expect(response.body.data[1].name).toContain('Chocolate');
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=cookies')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((sweet: any) => sweet.category === 'Cookies')).toBe(true);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=5&maxPrice=15')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Chocolate Brownie');
      expect(parseFloat(response.body.data[0].price)).toBeGreaterThanOrEqual(5);
      expect(parseFloat(response.body.data[0].price)).toBeLessThanOrEqual(15);
    });

    it('should combine multiple search filters', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=cookies&maxPrice=4')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((sweet: any) => 
        sweet.category === 'Cookies' && parseFloat(sweet.price) <= 4
      )).toBe(true);
    });

    it('should handle search with pagination', async () => {
      const response = await request(app)
        .get('/api/sweets/search?page=1&limit=2')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=nonexistent')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle invalid price parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=invalid&maxPrice=alsoinvalid')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('price');
    });
  });
});