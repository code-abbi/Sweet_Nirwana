/**
 * GREEN PHASE: Order Model Minimal Implementation Tests
 * 
 * This test suite verifies the minimal implementation that makes
 * the RED phase tests pass. The focus is on simple, working
 * functionality without advanced features.
 * 
 * Expected Result: ALL TESTS SHOULD PASS (GREEN phase of TDD)
 */

import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from '../../src/models/Order';
import { OrderValidationError } from '../../src/errors/OrderErrors';

describe('Order Model - GREEN Phase (Minimal Implementation)', () => {
  
  describe('Order Creation', () => {
    
    it('should create an order with valid data', async () => {
      const orderData = {
        customerId: 'user123',
        items: [
          { sweetId: 'sweet1', quantity: 2, unitPrice: 150 }
        ],
        customerName: 'Test User',
        customerPhone: '+919876543210'
      };
      
      const order = await Order.create(orderData);
      
      expect(order).toBeInstanceOf(Order);
      expect(order.id).toBeDefined();
      expect(order.customerId).toBe('user123');
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBe(300);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentStatus).toBe(PaymentStatus.PENDING);
    });
    
    it('should validate customerId is required', async () => {
      const invalidData = {
        customerName: 'Test User'
      } as any;
      
      await expect(Order.create(invalidData))
        .rejects
        .toThrow(OrderValidationError);
    });
    
    it('should validate order has items', async () => {
      const orderData = {
        customerId: 'user123',
        items: [],
        customerName: 'Test User'
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Order must contain at least one item');
    });
    
  });
  
  describe('Cart Operations', () => {
    
    it('should add items to cart', async () => {
      const order = new Order({ customerId: 'user123' });
      
      await order.addItem('sweet1', 2, 150);
      
      expect(order.items).toHaveLength(1);
      expect(order.items[0]?.sweetId).toBe('sweet1');
      expect(order.items[0]?.quantity).toBe(2);
      expect(order.items[0]?.unitPrice).toBe(150);
      expect(order.getTotalAmount()).toBe(300);
    });
    
    it('should update existing item quantity', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      
      await order.updateItemQuantity('sweet1', 5);
      
      expect(order.items).toHaveLength(1);
      expect(order.items[0]?.quantity).toBe(5);
      expect(order.getTotalAmount()).toBe(750);
    });
    
    it('should remove items from cart', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      await order.addItem('sweet2', 1, 200);
      
      await order.removeItem('sweet1');
      
      expect(order.items).toHaveLength(1);
      expect(order.items[0]?.sweetId).toBe('sweet2');
      expect(order.getTotalAmount()).toBe(200);
    });
    
  });
  
  describe('Status Management', () => {
    
    it('should confirm pending order', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PENDING;
      
      await order.confirmOrder();
      
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.confirmedAt).toBeInstanceOf(Date);
    });
    
    it('should start preparing confirmed order', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.CONFIRMED;
      
      await order.startPreparing();
      
      expect(order.status).toBe(OrderStatus.PREPARING);
      expect(order.preparingStartedAt).toBeInstanceOf(Date);
    });
    
    it('should mark order as ready', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PREPARING;
      
      await order.markReady();
      
      expect(order.status).toBe(OrderStatus.READY);
      expect(order.readyAt).toBeInstanceOf(Date);
    });
    
    it('should cancel order', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PENDING;
      
      await order.cancelOrder('Customer requested');
      
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.cancelledAt).toBeInstanceOf(Date);
      expect(order.cancellationReason).toBe('Customer requested');
    });
    
  });
  
  describe('Payment Processing', () => {
    
    it('should process successful payment', async () => {
      const order = new Order({ customerId: 'user123' });
      
      const result = await order.processPayment({
        method: 'credit_card',
        cardToken: 'valid_token',
        amount: 300
      });
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(order.paymentStatus).toBe(PaymentStatus.PAID);
      expect(order.paymentMethod).toBe('credit_card');
      expect(order.paidAt).toBeInstanceOf(Date);
    });
    
    it('should handle payment failure', async () => {
      const order = new Order({ customerId: 'user123' });
      
      const result = await order.processPayment({
        method: 'credit_card',
        cardToken: 'invalid_token',
        amount: 300
      });
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(order.paymentStatus).toBe(PaymentStatus.FAILED);
    });
    
  });
  
  describe('Order Queries', () => {
    
    it('should find order by ID', async () => {
      const order = await Order.findById('order123');
      
      expect(order).toBeInstanceOf(Order);
      expect(order.id).toBe('order123');
    });
    
    it('should find orders by customer ID', async () => {
      const orders = await Order.findByCustomerId('user123');
      
      expect(Array.isArray(orders)).toBe(true);
      expect(orders).toHaveLength(2); // Mock returns 2 orders
      orders.forEach(order => {
        expect(order.customerId).toBe('user123');
      });
    });
    
    it('should find orders by status', async () => {
      const orders = await Order.findByStatus(OrderStatus.PENDING);
      
      expect(Array.isArray(orders)).toBe(true);
      expect(orders).toHaveLength(1); // Mock returns 1 pending order
      orders.forEach(order => {
        expect(order.status).toBe(OrderStatus.PENDING);
      });
    });
    
  });
  
});