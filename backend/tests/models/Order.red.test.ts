/**
 * RED PHASE: Order Model Failing Tests
 * 
 * This test suite defines the comprehensive requirements for the Order model
 * by writing tests that will initially FAIL. These tests define:
 * - Order creation and validation
 * - Cart functionality and item management
 * - Order status tracking and workflow
 * - Payment integration and processing
 * - Delivery and shipping management
 * - Order history and analytics
 * 
 * Expected Result: ALL TESTS SHOULD FAIL (RED phase of TDD)
 */

import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from '../../src/models/Order';
import { OrderValidationError, OrderNotFoundError, OrderStatusError } from '../../src/errors/OrderErrors';

describe('Order Model - RED Phase (Comprehensive Requirements)', () => {
  
  describe('Order Creation and Validation', () => {
    
    it('should create an order with valid customer and items', async () => {
      const orderData = {
        customerId: 'user123',
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
        customerName: 'Raj Kumar',
        customerPhone: '+919876543210',
        customerEmail: 'raj@example.com'
      };
      
      const order = await Order.create(orderData);
      
      expect(order.id).toBeDefined();
      expect(order.customerId).toBe('user123');
      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(500); // 2*150 + 1*200
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(order.deliveryStatus).toBe(DeliveryStatus.PENDING);
      expect(order.createdAt).toBeInstanceOf(Date);
    });
    
    it('should validate required fields during order creation', async () => {
      const invalidOrderData = {
        // Missing customerId
        items: [],
        customerName: 'Test User'
      };
      
      await expect(Order.create(invalidOrderData))
        .rejects
        .toThrow(OrderValidationError);
    });
    
    it('should validate order items are not empty', async () => {
      const orderData = {
        customerId: 'user123',
        items: [], // Empty items
        customerName: 'Test User',
        customerPhone: '+919876543210'
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Order must contain at least one item');
    });
    
    it('should validate item quantities are positive', async () => {
      const orderData = {
        customerId: 'user123',
        items: [
          { sweetId: 'sweet1', quantity: 0, unitPrice: 150 } // Invalid quantity
        ],
        customerName: 'Test User'
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Item quantity must be greater than 0');
    });
    
  });
  
  describe('Cart Functionality', () => {
    
    it('should add items to cart', async () => {
      const order = new Order({ customerId: 'user123' });
      
      await order.addItem('sweet1', 2, 150);
      await order.addItem('sweet2', 1, 200);
      
      expect(order.items).toHaveLength(2);
      expect(order.getTotalAmount()).toBe(500);
    });
    
    it('should update item quantity in cart', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      
      await order.updateItemQuantity('sweet1', 5);
      
      const item = order.getItem('sweet1');
      expect(item.quantity).toBe(5);
      expect(order.getTotalAmount()).toBe(750);
    });
    
    it('should remove items from cart', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      await order.addItem('sweet2', 1, 200);
      
      await order.removeItem('sweet1');
      
      expect(order.items).toHaveLength(1);
      expect(order.getTotalAmount()).toBe(200);
    });
    
    it('should clear entire cart', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      await order.addItem('sweet2', 1, 200);
      
      await order.clearCart();
      
      expect(order.items).toHaveLength(0);
      expect(order.getTotalAmount()).toBe(0);
    });
    
  });
  
  describe('Order Status Management', () => {
    
    it('should transition order status from PENDING to CONFIRMED', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PENDING;
      
      await order.confirmOrder();
      
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.confirmedAt).toBeInstanceOf(Date);
    });
    
    it('should transition order status from CONFIRMED to PREPARING', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.CONFIRMED;
      
      await order.startPreparing();
      
      expect(order.status).toBe(OrderStatus.PREPARING);
      expect(order.preparingStartedAt).toBeInstanceOf(Date);
    });
    
    it('should transition order status from PREPARING to READY', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PREPARING;
      
      await order.markReady();
      
      expect(order.status).toBe(OrderStatus.READY);
      expect(order.readyAt).toBeInstanceOf(Date);
    });
    
    it('should transition order status to DELIVERED', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.READY;
      
      await order.markDelivered();
      
      expect(order.status).toBe(OrderStatus.DELIVERED);
      expect(order.deliveredAt).toBeInstanceOf(Date);
    });
    
    it('should cancel order if in valid status', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PENDING;
      
      await order.cancelOrder('Customer requested cancellation');
      
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.cancelledAt).toBeInstanceOf(Date);
      expect(order.cancellationReason).toBe('Customer requested cancellation');
    });
    
    it('should prevent invalid status transitions', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.DELIVERED;
      
      await expect(order.confirmOrder())
        .rejects
        .toThrow(OrderStatusError);
    });
    
  });
  
  describe('Payment Integration', () => {
    
    it('should process payment for order', async () => {
      const order = new Order({
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 2, unitPrice: 150 }]
      });
      
      const paymentResult = await order.processPayment({
        method: 'credit_card',
        cardToken: 'card_token_123',
        amount: 300
      });
      
      expect(paymentResult.success).toBe(true);
      expect(order.paymentStatus).toBe(PaymentStatus.PAID);
      expect(order.paymentMethod).toBe('credit_card');
      expect(order.paidAt).toBeInstanceOf(Date);
    });
    
    it('should handle payment failure', async () => {
      const order = new Order({
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 2, unitPrice: 150 }]
      });
      
      const paymentResult = await order.processPayment({
        method: 'credit_card',
        cardToken: 'invalid_token',
        amount: 300
      });
      
      expect(paymentResult.success).toBe(false);
      expect(order.paymentStatus).toBe(PaymentStatus.FAILED);
    });
    
    it('should process refund for cancelled order', async () => {
      const order = new Order({ customerId: 'user123' });
      order.paymentStatus = PaymentStatus.PAID;
      
      const refundResult = await order.processRefund();
      
      expect(refundResult.success).toBe(true);
      expect(order.paymentStatus).toBe(PaymentStatus.REFUNDED);
      expect(order.refundedAt).toBeInstanceOf(Date);
    });
    
  });
  
  describe('Delivery Management', () => {
    
    it('should assign delivery partner', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.READY;
      
      await order.assignDeliveryPartner('partner123');
      
      expect(order.deliveryPartnerId).toBe('partner123');
      expect(order.deliveryStatus).toBe(DeliveryStatus.ASSIGNED);
    });
    
    it('should track delivery status', async () => {
      const order = new Order({ customerId: 'user123' });
      order.deliveryStatus = DeliveryStatus.ASSIGNED;
      
      await order.updateDeliveryStatus(DeliveryStatus.OUT_FOR_DELIVERY);
      
      expect(order.deliveryStatus).toBe(DeliveryStatus.OUT_FOR_DELIVERY);
    });
    
    it('should calculate estimated delivery time', async () => {
      const order = new Order({
        customerId: 'user123',
        deliveryAddress: {
          city: 'Mumbai',
          zipCode: '400001'
        }
      });
      
      const estimatedTime = await order.calculateEstimatedDeliveryTime();
      
      expect(estimatedTime).toBeInstanceOf(Date);
      expect(estimatedTime.getTime()).toBeGreaterThan(Date.now());
    });
    
  });
  
  describe('Order Queries and Analytics', () => {
    
    it('should find order by ID', async () => {
      const order = await Order.findById('order123');
      
      expect(order).toBeInstanceOf(Order);
      expect(order.id).toBe('order123');
    });
    
    it('should find orders by customer ID', async () => {
      const orders = await Order.findByCustomerId('user123');
      
      expect(Array.isArray(orders)).toBe(true);
      orders.forEach((order: any) => {
        expect(order.customerId).toBe('user123');
      });
    });
    
    it('should find orders by status', async () => {
      const pendingOrders = await Order.findByStatus(OrderStatus.PENDING);
      
      expect(Array.isArray(pendingOrders)).toBe(true);
      pendingOrders.forEach((order: any) => {
        expect(order.status).toBe(OrderStatus.PENDING);
      });
    });
    
    it('should find orders within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const orders = await Order.findByDateRange(startDate, endDate);
      
      expect(Array.isArray(orders)).toBe(true);
      orders.forEach((order: any) => {
        expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(order.createdAt.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
    
    it('should get order analytics for dashboard', async () => {
      const analytics = await Order.getAnalytics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      });
      
      expect(typeof analytics.totalOrders).toBe('number');
      expect(typeof analytics.totalRevenue).toBe('number');
      expect(typeof analytics.averageOrderValue).toBe('number');
      expect(typeof analytics.ordersByStatus).toBe('object');
      expect(analytics.topCustomers).toBeInstanceOf(Array);
    });
    
  });
  
  describe('Order Validation and Business Rules', () => {
    
    it('should validate delivery address format', async () => {
      const orderData = {
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 150 }],
        deliveryAddress: {
          street: '', // Invalid empty street
          city: 'Mumbai'
        }
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Delivery address street is required');
    });
    
    it('should validate phone number format', async () => {
      const orderData = {
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 150 }],
        customerPhone: '123456' // Invalid phone format
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Invalid phone number format');
    });
    
    it('should validate email format', async () => {
      const orderData = {
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 150 }],
        customerEmail: 'invalid-email' // Invalid email format
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Invalid email format');
    });
    
    it('should apply discount if eligible', async () => {
      const order = new Order({
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 10, unitPrice: 150 }]
      });
      
      await order.applyDiscount('BULK10', 10); // 10% discount
      
      expect(order.discountCode).toBe('BULK10');
      expect(order.discountAmount).toBe(150); // 10% of 1500
      expect(order.getFinalAmount()).toBe(1350);
    });
    
    it('should calculate tax based on delivery location', async () => {
      const order = new Order({
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 1000 }],
        deliveryAddress: {
          state: 'Maharashtra',
          country: 'India'
        }
      });
      
      await order.calculateTax();
      
      expect(order.taxAmount).toBeGreaterThan(0);
      expect(order.taxRate).toBeDefined();
    });
    
  });
  
});