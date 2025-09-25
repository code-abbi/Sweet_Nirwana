/**
 * RED PHASE: Order Model Failing Tests (Simplified)
 * 
 * This test suite defines the core requirements for the Order model
 * by writing tests that will initially FAIL. These tests define:
 * - Basic order creation and validation
 * - Core cart functionality
 * - Order status management
 * - Payment processing
 * - Basic delivery tracking
 * 
 * Expected Result: ALL TESTS SHOULD FAIL (RED phase of TDD)
 */

import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from '../../src/models/Order';
import { OrderValidationError } from '../../src/errors/OrderErrors';

describe('Order Model - RED Phase (Core Requirements)', () => {
  
  describe('Order Creation', () => {
    
    it('should create an order with valid customer and items', async () => {
      const orderData = {
        customerId: 'user123',
        items: [
          { sweetId: 'sweet1', quantity: 2, unitPrice: 150 }
        ],
        customerName: 'Test User',
        customerPhone: '+919876543210'
      };
      
      const order = await Order.create(orderData);
      
      expect(order.id).toBeDefined();
      expect(order.customerId).toBe('user123');
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBe(300);
      expect(order.status).toBe(OrderStatus.PENDING);
    });
    
    it('should validate required customerId', async () => {
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
  
  describe('Cart Management', () => {
    
    it('should add items to cart', async () => {
      const order = new Order({ customerId: 'user123' });
      
      await order.addItem('sweet1', 2, 150);
      
      expect(order.items).toHaveLength(1);
      expect(order.getTotalAmount()).toBe(300);
    });
    
    it('should update item quantity', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      
      await order.updateItemQuantity('sweet1', 5);
      
      const item = order.getItem('sweet1');
      expect(item.quantity).toBe(5);
    });
    
    it('should remove items from cart', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('sweet1', 2, 150);
      
      await order.removeItem('sweet1');
      
      expect(order.items).toHaveLength(0);
    });
    
  });
  
  describe('Order Status Management', () => {
    
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
    });
    
    it('should mark order as ready', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PREPARING;
      
      await order.markReady();
      
      expect(order.status).toBe(OrderStatus.READY);
    });
    
    it('should cancel order with reason', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PENDING;
      
      await order.cancelOrder('Customer requested');
      
      expect(order.status).toBe(OrderStatus.CANCELLED);
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
      expect(order.paymentStatus).toBe(PaymentStatus.PAID);
    });
    
    it('should handle payment failure', async () => {
      const order = new Order({ customerId: 'user123' });
      
      const result = await order.processPayment({
        method: 'credit_card',
        cardToken: 'invalid_token',
        amount: 300
      });
      
      expect(result.success).toBe(false);
      expect(order.paymentStatus).toBe(PaymentStatus.FAILED);
    });
    
  });
  
  describe('Order Queries', () => {
    
    it('should find order by ID', async () => {
      const order = await Order.findById('order123');
      
      expect(order).toBeInstanceOf(Order);
      expect(order.id).toBe('order123');
    });
    
    it('should find orders by customer', async () => {
      const orders = await Order.findByCustomerId('user123');
      
      expect(Array.isArray(orders)).toBe(true);
    });
    
    it('should find orders by status', async () => {
      const orders = await Order.findByStatus(OrderStatus.PENDING);
      
      expect(Array.isArray(orders)).toBe(true);
    });
    
  });
  
});