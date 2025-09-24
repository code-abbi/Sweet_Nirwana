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

// Mock inventory service with in-memory storage for tests
const mockInventory: any[] = [];
const mockTransactions: any[] = [];
let transactionIdCounter = 1;

jest.mock('../src/utils/inventoryService', () => ({
  InventoryService: {
    purchaseSweet: jest.fn((sweetId, quantity, userId) => {
      // Find sweet in inventory
      const inventoryItem = mockInventory.find(item => item.sweetId === sweetId);
      if (!inventoryItem || inventoryItem.quantity < quantity) {
        return Promise.resolve({ success: false, error: 'Insufficient stock' });
      }
      
      // Reduce quantity
      inventoryItem.quantity -= quantity;
      
      // Create transaction record
      const transaction = {
        id: `txn-${transactionIdCounter++}`,
        sweetId,
        userId,
        type: 'purchase',
        quantity,
        price: inventoryItem.price * quantity,
        timestamp: new Date(),
      };
      mockTransactions.push(transaction);
      
      return Promise.resolve({
        success: true,
        transaction,
        remainingStock: inventoryItem.quantity
      });
    }),
    
    restockSweet: jest.fn((sweetId, quantity, userId) => {
      // Find or create inventory item
      let inventoryItem = mockInventory.find(item => item.sweetId === sweetId);
      if (!inventoryItem) {
        inventoryItem = {
          sweetId,
          quantity: 0,
          price: 10.00, // Default price for testing
          lastRestocked: new Date(),
          restockedBy: userId
        };
        mockInventory.push(inventoryItem);
      }
      
      // Add quantity
      inventoryItem.quantity += quantity;
      inventoryItem.lastRestocked = new Date();
      inventoryItem.restockedBy = userId;
      
      // Create transaction record
      const transaction = {
        id: `txn-${transactionIdCounter++}`,
        sweetId,
        userId,
        type: 'restock',
        quantity,
        timestamp: new Date(),
      };
      mockTransactions.push(transaction);
      
      return Promise.resolve({
        success: true,
        transaction,
        newStock: inventoryItem.quantity
      });
    }),
    
    getInventoryStatus: jest.fn(() => {
      return Promise.resolve(mockInventory.map(item => ({
        ...item,
        status: item.quantity <= 5 ? 'low' : item.quantity === 0 ? 'out_of_stock' : 'in_stock'
      })));
    }),
    
    getTransactionHistory: jest.fn((filters = {}) => {
      let filteredTransactions = [...mockTransactions];
      
      if (filters.sweetId) {
        filteredTransactions = filteredTransactions.filter(txn => txn.sweetId === filters.sweetId);
      }
      
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(txn => txn.type === filters.type);
      }
      
      if (filters.userId) {
        filteredTransactions = filteredTransactions.filter(txn => txn.userId === filters.userId);
      }
      
      // Sort by timestamp (newest first)
      filteredTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return Promise.resolve({
        transactions: filteredTransactions.slice(start, end),
        totalCount: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limit)
      });
    }),
    
    getLowStockAlert: jest.fn((threshold = 5) => {
      const lowStockItems = mockInventory.filter(item => item.quantity <= threshold && item.quantity > 0);
      const outOfStockItems = mockInventory.filter(item => item.quantity === 0);
      
      return Promise.resolve({
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        alertCount: lowStockItems.length + outOfStockItems.length
      });
    })
  }
}));

// Mock sweet service to provide sweet details
jest.mock('../src/utils/sweetService', () => ({
  SweetService: {
    getSweetById: jest.fn((id: string) => {
      const sweets: Record<string, any> = {
        'chocolate-cake': {
          id: 'chocolate-cake',
          name: 'Chocolate Cake',
          price: 25.99,
          category: 'cakes'
        },
        'vanilla-cupcake': {
          id: 'vanilla-cupcake',
          name: 'Vanilla Cupcake',
          price: 3.99,
          category: 'cupcakes'
        },
        'strawberry-tart': {
          id: 'strawberry-tart',
          name: 'Strawberry Tart',
          price: 8.50,
          category: 'pastries'
        }
      };
      return Promise.resolve(sweets[id] || null);
    })
  }
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
  // Reset mock data
  mockInventory.length = 0;
  mockTransactions.length = 0;
  transactionIdCounter = 1;
  
  // Add some initial inventory for testing
  mockInventory.push(
    {
      sweetId: 'chocolate-cake',
      quantity: 10,
      price: 25.99,
      lastRestocked: new Date(),
      restockedBy: 'admin-user-id'
    },
    {
      sweetId: 'vanilla-cupcake',
      quantity: 2, // Low stock
      price: 3.99,
      lastRestocked: new Date(),
      restockedBy: 'admin-user-id'
    },
    {
      sweetId: 'strawberry-tart',
      quantity: 0, // Out of stock
      price: 8.50,
      lastRestocked: new Date(),
      restockedBy: 'admin-user-id'
    }
  );
  
  jest.clearAllMocks();
});

describe('Inventory Management Endpoints', () => {
  describe('POST /api/inventory/purchase', () => {
    it('should allow users to purchase sweets with sufficient stock', async () => {
      const userToken = createUserToken();
      const purchaseData = {
        sweetId: 'chocolate-cake',
        quantity: 3
      };

      const response = await request(app)
        .post('/api/inventory/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Purchase completed successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('transaction');
      expect(response.body.data).toHaveProperty('remainingStock', 7);
      expect(response.body.data.transaction).toHaveProperty('type', 'purchase');
      expect(response.body.data.transaction).toHaveProperty('quantity', 3);
    });

    it('should fail when purchasing more than available stock', async () => {
      const userToken = createUserToken();
      const purchaseData = {
        sweetId: 'vanilla-cupcake', // Only 2 in stock
        quantity: 5
      };

      const response = await request(app)
        .post('/api/inventory/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Insufficient stock');
    });

    it('should fail when purchasing out of stock items', async () => {
      const userToken = createUserToken();
      const purchaseData = {
        sweetId: 'strawberry-tart', // 0 in stock
        quantity: 1
      };

      const response = await request(app)
        .post('/api/inventory/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Insufficient stock');
    });

    it('should require authentication for purchases', async () => {
      const purchaseData = {
        sweetId: 'chocolate-cake',
        quantity: 1
      };

      await request(app)
        .post('/api/inventory/purchase')
        .send(purchaseData)
        .expect(401);
    });

    it('should validate required fields for purchase', async () => {
      const userToken = createUserToken();
      const invalidPurchaseData = {
        // Missing sweetId and quantity
      };

      const response = await request(app)
        .post('/api/inventory/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidPurchaseData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate quantity is a positive integer', async () => {
      const userToken = createUserToken();
      const invalidPurchaseData = {
        sweetId: 'chocolate-cake',
        quantity: -1 // Invalid negative quantity
      };

      const response = await request(app)
        .post('/api/inventory/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidPurchaseData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('quantity');
    });
  });

  describe('POST /api/inventory/restock', () => {
    it('should allow admins to restock sweets', async () => {
      const adminToken = createAdminToken();
      const restockData = {
        sweetId: 'vanilla-cupcake',
        quantity: 20
      };

      const response = await request(app)
        .post('/api/inventory/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Restock completed successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('transaction');
      expect(response.body.data).toHaveProperty('newStock', 22); // 2 + 20
      expect(response.body.data.transaction).toHaveProperty('type', 'restock');
      expect(response.body.data.transaction).toHaveProperty('quantity', 20);
    });

    it('should allow restocking out of stock items', async () => {
      const adminToken = createAdminToken();
      const restockData = {
        sweetId: 'strawberry-tart', // Currently 0 in stock
        quantity: 15
      };

      const response = await request(app)
        .post('/api/inventory/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('newStock', 15);
    });

    it('should not allow regular users to restock', async () => {
      const userToken = createUserToken();
      const restockData = {
        sweetId: 'vanilla-cupcake',
        quantity: 10
      };

      const response = await request(app)
        .post('/api/inventory/restock')
        .set('Authorization', `Bearer ${userToken}`)
        .send(restockData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication for restocking', async () => {
      const restockData = {
        sweetId: 'chocolate-cake',
        quantity: 5
      };

      await request(app)
        .post('/api/inventory/restock')
        .send(restockData)
        .expect(401);
    });

    it('should validate restock data', async () => {
      const adminToken = createAdminToken();
      const invalidRestockData = {
        sweetId: 'chocolate-cake',
        quantity: -5 // Invalid negative quantity
      };

      const response = await request(app)
        .post('/api/inventory/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidRestockData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('quantity');
    });
  });

  describe('GET /api/inventory/status', () => {
    it('should get inventory status for all items', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
      
      const chocolateCake = response.body.data.find((item: any) => item.sweetId === 'chocolate-cake');
      expect(chocolateCake).toHaveProperty('status', 'in_stock');
      expect(chocolateCake).toHaveProperty('quantity', 10);

      const vanillaCupcake = response.body.data.find((item: any) => item.sweetId === 'vanilla-cupcake');
      expect(vanillaCupcake).toHaveProperty('status', 'low');
      expect(vanillaCupcake).toHaveProperty('quantity', 2);

      const strawberryTart = response.body.data.find((item: any) => item.sweetId === 'strawberry-tart');
      expect(strawberryTart).toHaveProperty('status', 'out_of_stock');
      expect(strawberryTart).toHaveProperty('quantity', 0);
    });

    it('should require admin access for inventory status', async () => {
      const userToken = createUserToken();

      const response = await request(app)
        .get('/api/inventory/status')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication for inventory status', async () => {
      await request(app)
        .get('/api/inventory/status')
        .expect(401);
    });
  });

  describe('GET /api/inventory/transactions', () => {
    beforeEach(async () => {
      // Create some transaction history for testing
      const userToken = createUserToken();
      const adminToken = createAdminToken();

      // Make a purchase
      await request(app)
        .post('/api/inventory/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: 'chocolate-cake', quantity: 2 });

      // Make a restock
      await request(app)
        .post('/api/inventory/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sweetId: 'vanilla-cupcake', quantity: 10 });
    });

    it('should get transaction history for admins', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('transactions');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
      expect(response.body.data.transactions.length).toBeGreaterThan(0);
      expect(response.body.data).toHaveProperty('totalCount');
      expect(response.body.data).toHaveProperty('totalPages');
    });

    it('should filter transactions by sweet ID', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/transactions?sweetId=chocolate-cake')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0]).toHaveProperty('sweetId', 'chocolate-cake');
    });

    it('should filter transactions by type', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/transactions?type=purchase')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.transactions.every((txn: any) => txn.type === 'purchase')).toBe(true);
    });

    it('should handle pagination for transactions', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/transactions?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data).toHaveProperty('totalPages');
    });

    it('should not allow regular users to view all transactions', async () => {
      const userToken = createUserToken();

      const response = await request(app)
        .get('/api/inventory/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow users to view their own transactions', async () => {
      const userToken = createUserToken();

      const response = await request(app)
        .get('/api/inventory/transactions/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.transactions.every((txn: any) => txn.userId === 'regular-user-id')).toBe(true);
    });
  });

  describe('GET /api/inventory/alerts', () => {
    it('should get low stock alerts for admins', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('lowStock');
      expect(response.body.data).toHaveProperty('outOfStock');
      expect(response.body.data).toHaveProperty('alertCount');
      
      expect(Array.isArray(response.body.data.lowStock)).toBe(true);
      expect(Array.isArray(response.body.data.outOfStock)).toBe(true);
      expect(response.body.data.alertCount).toBeGreaterThan(0);
    });

    it('should support custom low stock threshold', async () => {
      const adminToken = createAdminToken();

      const response = await request(app)
        .get('/api/inventory/alerts?threshold=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Should include chocolate-cake (10) and vanilla-cupcake (2) as low stock
      expect(response.body.data.alertCount).toBeGreaterThanOrEqual(2);
    });

    it('should require admin access for alerts', async () => {
      const userToken = createUserToken();

      const response = await request(app)
        .get('/api/inventory/alerts')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication for alerts', async () => {
      await request(app)
        .get('/api/inventory/alerts')
        .expect(401);
    });
  });
});