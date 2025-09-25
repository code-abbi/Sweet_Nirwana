/**
 * RED PHASE: API Endpoints Failing Tests
 * 
 * This test suite defines the comprehensive requirements for REST API endpoints
 * by writing tests that will initially FAIL. These tests define:
 * - User authentication endpoints (login, register, profile)
 * - Sweet management endpoints (CRUD operations, search, filtering)
 * - Order management endpoints (create, update, status, payment)
 * - Authentication middleware and authorization
 * - Request validation and error handling
 * - API response formatting and status codes
 * 
 * Expected Result: ALL TESTS SHOULD FAIL (RED phase of TDD)
 */

import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/models/User';
import { Sweet } from '../../src/models/Sweet';
import { Order } from '../../src/models/Order';

describe('API Endpoints - RED Phase (Comprehensive Requirements)', () => {
  
  describe('Authentication Endpoints', () => {
    
    describe('POST /api/auth/register', () => {
      
      it('should register a new user with valid data', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
          phone: '+919876543210'
        };
        
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body.data.user.id).toBeDefined();
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(response.body.data.user.name).toBe('Test User');
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.password).toBeUndefined(); // Should not expose password
      });
      
      it('should validate required fields', async () => {
        const invalidData = {
          email: 'test@example.com'
          // Missing password, name, phone
        };
        
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('validation');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors).toContain('Password is required');
      });
      
      it('should validate email format', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User',
          phone: '+919876543210'
        };
        
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('Invalid email format');
      });
      
      it('should prevent duplicate email registration', async () => {
        const userData = {
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Test User',
          phone: '+919876543210'
        };
        
        // First registration should succeed
        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);
        
        // Second registration with same email should fail
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(409);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Email already registered');
      });
      
    });
    
    describe('POST /api/auth/login', () => {
      
      it('should login user with valid credentials', async () => {
        // Assume user is already registered
        const credentials = {
          email: 'test@example.com',
          password: 'Password123!'
        };
        
        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.data.user.id).toBeDefined();
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.refreshToken).toBeDefined();
        expect(response.body.data.user.password).toBeUndefined();
      });
      
      it('should reject invalid credentials', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };
        
        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(401);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid email or password');
      });
      
      it('should validate required login fields', async () => {
        const credentials = {
          email: 'test@example.com'
          // Missing password
        };
        
        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('Password is required');
      });
      
    });
    
    describe('GET /api/auth/profile', () => {
      
      it('should get user profile with valid token', async () => {
        const token = 'valid_jwt_token';
        
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.id).toBeDefined();
        expect(response.body.data.user.email).toBeDefined();
        expect(response.body.data.user.name).toBeDefined();
        expect(response.body.data.user.password).toBeUndefined();
      });
      
      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .expect(401);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Access token required');
      });
      
      it('should reject invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid_token')
          .expect(401);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid token');
      });
      
    });
    
  });
  
  describe('Sweet Management Endpoints', () => {
    
    describe('GET /api/sweets', () => {
      
      it('should get all sweets with pagination', async () => {
        const response = await request(app)
          .get('/api/sweets?page=1&limit=10')
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.sweets).toBeInstanceOf(Array);
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(10);
        expect(response.body.data.pagination.total).toBeDefined();
        expect(response.body.data.pagination.pages).toBeDefined();
      });
      
      it('should filter sweets by category', async () => {
        const response = await request(app)
          .get('/api/sweets?category=milk_based')
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.sweets).toBeInstanceOf(Array);
        response.body.data.sweets.forEach((sweet: any) => {
          expect(sweet.category).toBe('milk_based');
        });
      });
      
      it('should search sweets by name', async () => {
        const response = await request(app)
          .get('/api/sweets?search=gulab')
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.sweets).toBeInstanceOf(Array);
        response.body.data.sweets.forEach((sweet: any) => {
          expect(sweet.name.toLowerCase()).toContain('gulab');
        });
      });
      
    });
    
    describe('GET /api/sweets/:id', () => {
      
      it('should get sweet by ID', async () => {
        const sweetId = 'sweet123';
        
        const response = await request(app)
          .get(`/api/sweets/${sweetId}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.sweet.id).toBe(sweetId);
        expect(response.body.data.sweet.name).toBeDefined();
        expect(response.body.data.sweet.price).toBeDefined();
        expect(response.body.data.sweet.description).toBeDefined();
      });
      
      it('should return 404 for non-existent sweet', async () => {
        const response = await request(app)
          .get('/api/sweets/nonexistent')
          .expect(404);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Sweet not found');
      });
      
    });
    
    describe('POST /api/sweets', () => {
      
      it('should create new sweet with admin authorization', async () => {
        const adminToken = 'valid_admin_token';
        const sweetData = {
          name: 'New Gulab Jamun',
          description: 'Delicious milk-based sweet',
          price: 150,
          category: 'milk_based',
          ingredients: ['milk', 'sugar', 'cardamom'],
          weight: 250,
          isVegetarian: true,
          shelfLife: 7
        };
        
        const response = await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(sweetData)
          .expect(201);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Sweet created successfully');
        expect(response.body.data.sweet.id).toBeDefined();
        expect(response.body.data.sweet.name).toBe('New Gulab Jamun');
        expect(response.body.data.sweet.price).toBe(150);
      });
      
      it('should reject unauthorized creation', async () => {
        const sweetData = {
          name: 'Unauthorized Sweet',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/sweets')
          .send(sweetData)
          .expect(401);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Access token required');
      });
      
      it('should validate required sweet fields', async () => {
        const adminToken = 'valid_admin_token';
        const invalidData = {
          name: 'Invalid Sweet'
          // Missing required fields
        };
        
        const response = await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('Price is required');
      });
      
    });
    
  });
  
  describe('Order Management Endpoints', () => {
    
    describe('POST /api/orders', () => {
      
      it('should create new order with authentication', async () => {
        const userToken = 'valid_user_token';
        const orderData = {
          items: [
            { sweetId: 'sweet1', quantity: 2, unitPrice: 150 },
            { sweetId: 'sweet2', quantity: 1, unitPrice: 200 }
          ],
          deliveryAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          customerName: 'Test User',
          customerPhone: '+919876543210'
        };
        
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Order created successfully');
        expect(response.body.data.order.id).toBeDefined();
        expect(response.body.data.order.totalAmount).toBe(500);
        expect(response.body.data.order.status).toBe('pending');
      });
      
      it('should validate order items', async () => {
        const userToken = 'valid_user_token';
        const orderData = {
          items: [], // Empty items array
          customerName: 'Test User'
        };
        
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('Order must contain at least one item');
      });
      
    });
    
    describe('GET /api/orders', () => {
      
      it('should get user orders with authentication', async () => {
        const userToken = 'valid_user_token';
        
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.orders).toBeInstanceOf(Array);
        expect(response.body.data.pagination).toBeDefined();
      });
      
      it('should filter orders by status', async () => {
        const userToken = 'valid_user_token';
        
        const response = await request(app)
          .get('/api/orders?status=pending')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        response.body.data.orders.forEach((order: any) => {
          expect(order.status).toBe('pending');
        });
      });
      
    });
    
    describe('PUT /api/orders/:id/status', () => {
      
      it('should update order status with admin authorization', async () => {
        const adminToken = 'valid_admin_token';
        const orderId = 'order123';
        
        const response = await request(app)
          .put(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'confirmed' })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Order status updated successfully');
        expect(response.body.data.order.status).toBe('confirmed');
      });
      
      it('should reject unauthorized status update', async () => {
        const userToken = 'valid_user_token'; // Regular user, not admin
        const orderId = 'order123';
        
        const response = await request(app)
          .put(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'confirmed' })
          .expect(403);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Admin access required');
      });
      
    });
    
    describe('POST /api/orders/:id/payment', () => {
      
      it('should process order payment', async () => {
        const userToken = 'valid_user_token';
        const orderId = 'order123';
        const paymentData = {
          method: 'credit_card',
          cardToken: 'valid_card_token',
          amount: 500
        };
        
        const response = await request(app)
          .post(`/api/orders/${orderId}/payment`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(paymentData)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Payment processed successfully');
        expect(response.body.data.payment.transactionId).toBeDefined();
        expect(response.body.data.order.paymentStatus).toBe('paid');
      });
      
      it('should handle payment failures', async () => {
        const userToken = 'valid_user_token';
        const orderId = 'order123';
        const paymentData = {
          method: 'credit_card',
          cardToken: 'invalid_card_token',
          amount: 500
        };
        
        const response = await request(app)
          .post(`/api/orders/${orderId}/payment`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(paymentData)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Payment failed');
        expect(response.body.data.order.paymentStatus).toBe('failed');
      });
      
    });
    
  });
  
  describe('API Error Handling', () => {
    
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
    
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send('invalid json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid JSON');
    });
    
    it('should handle internal server errors gracefully', async () => {
      // This would trigger an internal error in a real scenario
      const response = await request(app)
        .get('/api/trigger-error')
        .expect(500);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.error).toBeUndefined(); // Don't expose internal error details
    });
    
  });
  
  describe('API Rate Limiting', () => {
    
    it('should enforce rate limits on auth endpoints', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      // Make multiple requests rapidly
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(userData)
      );
      
      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      if (rateLimitedResponses.length > 0) {
        const rateLimitedResponse = rateLimitedResponses[0];
        expect(rateLimitedResponse.body.success).toBe(false);
        expect(rateLimitedResponse.body.message).toBe('Too many requests, please try again later');
      }
    });
    
  });
  
});