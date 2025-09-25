/**
 * REFACTOR PHASE: Order Model Enhanced Implementation Tests
 * 
 * This test suite verifies the enhanced, production-ready implementation
 * of the Order model with advanced features, validation, and business logic.
 * 
 * Expected Result: ENHANCED TESTS SHOULD PASS (REFACTOR phase of TDD)
 */

import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from '../../src/models/Order';
import { OrderValidationError, OrderStatusError } from '../../src/errors/OrderErrors';

describe('Order Model - REFACTOR Phase (Enhanced Implementation)', () => {
  
  describe('Advanced Order Creation & Validation', () => {
    
    it('should create order with enhanced validation and business rules', async () => {
      const orderData = {
        customerId: 'user123',
        items: [
          { sweetId: 'sweet1', quantity: 2, unitPrice: 150 },
          { sweetId: 'sweet2', quantity: 3, unitPrice: 200 }
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
      
      expect(order.id).toMatch(/^order_\d+_[a-z0-9]{9}$/);
      expect(order.customerId).toBe('user123');
      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(900); // 2*150 + 3*200
      expect(order.customerName).toBe('Raj Kumar');
      expect(order.customerPhone).toBe('+919876543210');
      expect(order.customerEmail).toBe('raj@example.com');
      expect(order.deliveryAddress?.city).toBe('Mumbai');
      expect(order.createdAt).toBeInstanceOf(Date);
    });
    
    it('should validate phone number format', async () => {
      const orderData = {
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 150 }],
        customerPhone: '123456' // Invalid format
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Invalid phone number format');
    });
    
    it('should validate email format', async () => {
      const orderData = {
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 150 }],
        customerEmail: 'invalid-email' // Invalid format
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Invalid email format');
    });
    
    it('should validate minimum order amount', async () => {
      const orderData = {
        customerId: 'user123',
        items: [{ sweetId: 'sweet1', quantity: 1, unitPrice: 10 }] // Too low
      };
      
      await expect(Order.create(orderData))
        .rejects
        .toThrow('Minimum order amount is ₹50');
    });
    
  });
  
  describe('Advanced Cart Operations', () => {
    
    it('should handle bulk item addition efficiently', async () => {
      const order = new Order({ customerId: 'user123' });
      
      const items = [
        { sweetId: 'sweet1', quantity: 5, unitPrice: 100 },
        { sweetId: 'sweet2', quantity: 3, unitPrice: 150 },
        { sweetId: 'sweet3', quantity: 2, unitPrice: 200 }
      ];
      
      await order.addBulkItems(items);
      
      expect(order.items).toHaveLength(3);
      expect(order.getTotalAmount()).toBe(1350); // 5*100 + 3*150 + 2*200
    });
    
    it('should apply quantity discounts automatically', async () => {
      const order = new Order({ customerId: 'user123' });
      
      await order.addItem('sweet1', 10, 100); // Bulk quantity
      
      expect(order.getTotalAmount()).toBe(950); // 10*100 with 5% bulk discount
      expect(order.discountAmount).toBe(50);
      expect(order.discountCode).toBe('BULK5');
    });
    
    it('should validate item availability', async () => {
      const order = new Order({ customerId: 'user123' });
      
      await expect(order.addItem('out_of_stock_sweet', 5, 100))
        .rejects
        .toThrow('Sweet is currently out of stock');
    });
    
    it('should calculate item-wise GST correctly', async () => {
      const order = new Order({ customerId: 'user123' });
      
      await order.addItem('sweet1', 2, 100);
      await order.calculateTax();
      
      expect(order.taxAmount).toBe(10); // 5% GST on ₹200
      expect(order.taxRate).toBe(5);
      expect(order.getFinalAmount()).toBe(210); // 200 + 10 tax
    });
    
  });
  
  describe('Advanced Status Management & Workflows', () => {
    
    it('should enforce valid status transitions', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.DELIVERED;
      
      await expect(order.confirmOrder())
        .rejects
        .toThrow(OrderStatusError);
    });
    
    it('should track status change history', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.PENDING;
      
      await order.confirmOrder();
      await order.startPreparing();
      
      expect(order.statusHistory).toHaveLength(2);
      expect(order.statusHistory?.[0]?.fromStatus).toBe(OrderStatus.PENDING);
      expect(order.statusHistory?.[0]?.toStatus).toBe(OrderStatus.CONFIRMED);
      expect(order.statusHistory?.[1]?.toStatus).toBe(OrderStatus.PREPARING);
    });
    
    it('should calculate preparation time estimates', async () => {
      const order = new Order({ customerId: 'user123' });
      await order.addItem('complex_sweet', 5, 200);
      
      const estimatedTime = await order.calculatePreparationTime();
      
      expect(estimatedTime).toBeGreaterThan(0);
      expect(estimatedTime).toBeLessThanOrEqual(60); // Max 60 minutes
    });
    
    it('should send notifications on status changes', async () => {
      const order = new Order({ customerId: 'user123' });
      order.status = OrderStatus.CONFIRMED;
      order.customerEmail = 'test@example.com';
      order.customerPhone = '+919876543210';
      
      const notificationSpy = jest.spyOn(order, 'sendNotification');
      
      await order.startPreparing();
      
      expect(notificationSpy).toHaveBeenCalledWith('order_preparing', {
        email: 'test@example.com',
        phone: '+919876543210'
      });
    });
    
  });
  
  describe('Enhanced Payment Processing', () => {
    
    it('should support multiple payment methods', async () => {
      const order = new Order({ customerId: 'user123' });
      
      const result = await order.processPayment({
        method: 'upi',
        upiId: 'user@paytm',
        amount: 500
      });
      
      expect(result.success).toBe(true);
      expect(order.paymentMethod).toBe('upi');
      expect(result.transactionId).toMatch(/^upi_/);
    });
    
    it('should handle partial payments', async () => {
      const order = new Order({ customerId: 'user123' });
      order.totalAmount = 1000;
      
      const result = await order.processPartialPayment({
        method: 'credit_card',
        amount: 600
      });
      
      expect(result.success).toBe(true);
      expect(order.paidAmount).toBe(600);
      expect(order.remainingAmount).toBe(400);
      expect(order.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
    });
    
    it('should implement payment retry mechanism', async () => {
      const order = new Order({ customerId: 'user123' });
      
      const result = await order.retryPayment({
        method: 'credit_card',
        cardToken: 'retry_token',
        amount: 500,
        retryAttempt: 2
      });
      
      expect(result.retryAttempt).toBe(2);
      expect(result.maxRetries).toBe(3);
    });
    
    it('should calculate and apply payment gateway fees', async () => {
      const order = new Order({ customerId: 'user123' });
      order.totalAmount = 1000;
      
      await order.processPayment({
        method: 'credit_card',
        amount: 1000
      });
      
      expect(order.paymentFee).toBe(24); // 2.4% for credit card
      expect(order.getFinalAmountWithFees()).toBe(1024);
    });
    
  });
  
  describe('Advanced Delivery & Logistics', () => {
    
    it('should calculate delivery charges based on distance', async () => {
      const order = new Order({
        customerId: 'user123',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Pune', // Different city
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India'
        }
      });
      
      const deliveryCharge = await order.calculateDeliveryCharges();
      
      expect(deliveryCharge).toBe(80); // Inter-city delivery
      expect(order.deliveryCharges).toBe(80);
    });
    
    it('should provide real-time delivery tracking', async () => {
      const order = new Order({ customerId: 'user123' });
      order.deliveryPartnerId = 'partner123';
      order.deliveryStatus = DeliveryStatus.OUT_FOR_DELIVERY;
      
      const trackingInfo = await order.getDeliveryTracking();
      
      expect(trackingInfo.currentLocation).toBeDefined();
      expect(trackingInfo.estimatedArrival).toBeInstanceOf(Date);
      expect(trackingInfo.partnerName).toBe('Speedy Delivery');
      expect(trackingInfo.partnerPhone).toBe('+919876543210');
    });
    
    it('should handle delivery rescheduling', async () => {
      const order = new Order({ customerId: 'user123' });
      order.deliveryStatus = DeliveryStatus.ASSIGNED;
      
      const newSlot = new Date();
      newSlot.setDate(newSlot.getDate() + 1);
      
      await order.rescheduleDelivery(newSlot, 'Customer unavailable');
      
      expect(order.deliverySlot).toEqual(newSlot);
      expect(order.rescheduleReason).toBe('Customer unavailable');
      expect(order.rescheduleCount).toBe(1);
    });
    
  });
  
  describe('Analytics & Reporting', () => {
    
    it('should provide comprehensive order analytics', async () => {
      const analytics = await Order.getAnalytics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        groupBy: 'month'
      });
      
      expect(analytics.totalOrders).toBeGreaterThan(0);
      expect(analytics.totalRevenue).toBeGreaterThan(0);
      expect(analytics.averageOrderValue).toBeGreaterThan(0);
      expect(analytics.conversionRate).toBeGreaterThan(0);
      expect(analytics.monthlyTrends).toHaveLength(12);
      expect(analytics.topProducts).toBeInstanceOf(Array);
    });
    
    it('should track customer order patterns', async () => {
      const patterns = await Order.getCustomerOrderPatterns('user123');
      
      expect(patterns.averageOrderValue).toBeGreaterThan(0);
      expect(patterns.orderFrequency).toBeDefined();
      expect(patterns.preferredItems).toBeInstanceOf(Array);
      expect(patterns.preferredDeliverySlots).toBeInstanceOf(Array);
      expect(patterns.loyaltyScore).toBeGreaterThanOrEqual(0);
    });
    
    it('should generate business intelligence reports', async () => {
      const report = await Order.generateBusinessReport({
        type: 'weekly_summary',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-07')
      });
      
      expect(report.summary).toBeDefined();
      expect(report.metrics.newCustomers).toBeGreaterThanOrEqual(0);
      expect(report.metrics.repeatCustomers).toBeGreaterThanOrEqual(0);
      expect(report.metrics.cancellationRate).toBeGreaterThanOrEqual(0);
      expect(report.recommendations).toBeInstanceOf(Array);
    });
    
  });
  
});