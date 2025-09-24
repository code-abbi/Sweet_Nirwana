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

// Mock user service with in-memory storage for tests
const mockUsers: any[] = [];
let userIdCounter = 1;

jest.mock('../src/utils/userService', () => ({
  UserService: {
    createUser: jest.fn((userData) => {
      const newUser = {
        id: `user-${userIdCounter++}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return Promise.resolve(newUser);
    }),
    findUserByEmail: jest.fn((email) => {
      const user = mockUsers.find(u => u.email === email);
      return Promise.resolve(user || null);
    }),
    findUserById: jest.fn((id) => {
      const user = mockUsers.find(u => u.id === id);
      return Promise.resolve(user || null);
    }),
    userExistsByEmail: jest.fn((email) => {
      const exists = mockUsers.some(u => u.email === email);
      return Promise.resolve(exists);
    }),
    verifyPassword: jest.fn((email, password) => {
      // For testing, verify that user exists AND password matches what we used during registration
      const user = mockUsers.find(u => u.email === email);
      if (!user) return Promise.resolve(null);
      
      // Simple password verification for testing - expect 'securePassword123'
      if (password === 'securePassword123') {
        return Promise.resolve(user);
      }
      
      return Promise.resolve(null);
    }),
  },
}));

// Test setup
beforeEach(() => {
  // Clear mock users and reset mocks before each test
  mockUsers.length = 0;
  userIdCounter = 1;
  jest.clearAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  jest.restoreAllMocks();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('firstName', userData.firstName);
      expect(response.body.user).toHaveProperty('lastName', userData.lastName);
      expect(response.body.user).toHaveProperty('role', 'user'); // Default role
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should not register user with missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John'
        // Missing lastName and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123'
      };

      // Register user first time
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register same email again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should not register user with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '123' // Too weak
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login user with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Token should be a valid JWT format
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should not login user with incorrect email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should not login user with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should not login with missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authentication Middleware', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get a valid token
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      authToken = loginResponse.body.token;
    });

    it('should allow access to protected routes with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should deny access to protected routes without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('token');
    });

    it('should deny access to protected routes with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid token');
    });

    it('should deny access to admin routes for regular users', async () => {
      const response = await request(app)
        .delete('/api/sweets/some-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Admin');
    });
  });

  describe('Admin User Creation', () => {
    it('should create admin user with admin role', async () => {
      const adminData = {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'securePassword123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      expect(response.body.user).toHaveProperty('role', 'admin');
    });

    it('should allow admin access to admin routes', async () => {
      const adminData = {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'securePassword123',
        role: 'admin'
      };

      // Register admin
      await request(app)
        .post('/api/auth/register')
        .send(adminData);

      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminData.email,
          password: adminData.password
        });

      const adminToken = loginResponse.body.token;

      // Should have access to admin routes (this will pass once we implement the routes)
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});