/**
 * Order Model - Basic Structure (RED Phase)
 * 
 * This file defines the basic Order model structure with minimal
 * implementations that will fail the RED phase tests. The goal is
 * to have basic type definitions and method signatures that allow
 * the tests to run and fail appropriately.
 */

import { OrderValidationError, OrderNotFoundError, OrderStatusError } from '../errors/OrderErrors';

// Enums for Order-related statuses
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered'
}

// Interfaces for Order-related data structures
export interface OrderItem {
  sweetId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentData {
  method: string;
  cardToken?: string;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  errorMessage?: string;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  topCustomers: Array<{
    customerId: string;
    orderCount: number;
    totalSpent: number;
  }>;
}

export interface OrderData {
  customerId: string;
  items?: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

/**
 * Order Model Class
 * 
 * This class represents an order in the sweet shop system.
 * It handles order creation, status management, payments, and delivery tracking.
 */
export class Order {
  public id?: string;
  public customerId: string;
  public items: OrderItem[] = [];
  public deliveryAddress?: DeliveryAddress;
  public customerName?: string;
  public customerPhone?: string;
  public customerEmail?: string;
  
  // Status fields
  public status: OrderStatus = OrderStatus.PENDING;
  public paymentStatus: PaymentStatus = PaymentStatus.PENDING;
  public deliveryStatus: DeliveryStatus = DeliveryStatus.PENDING;
  
  // Timestamps
  public createdAt: Date = new Date();
  public confirmedAt?: Date;
  public preparingStartedAt?: Date;
  public readyAt?: Date;
  public deliveredAt?: Date;
  public cancelledAt?: Date;
  public paidAt?: Date;
  public refundedAt?: Date;
  
  // Financial fields
  public totalAmount: number = 0;
  public discountCode?: string;
  public discountAmount: number = 0;
  public taxAmount: number = 0;
  public taxRate?: number;
  
  // Payment and delivery
  public paymentMethod?: string;
  public deliveryPartnerId?: string;
  public cancellationReason?: string;
  
  constructor(data: OrderData) {
    this.customerId = data.customerId;
    if (data.items) {
      this.items = data.items;
    }
    if (data.deliveryAddress) {
      this.deliveryAddress = data.deliveryAddress;
    }
    if (data.customerName) {
      this.customerName = data.customerName;
    }
    if (data.customerPhone) {
      this.customerPhone = data.customerPhone;
    }
    if (data.customerEmail) {
      this.customerEmail = data.customerEmail;
    }
  }
  
  // Static factory methods (GREEN phase - minimal implementation)
  static async create(orderData: OrderData): Promise<Order> {
    // Validation
    if (!orderData.customerId) {
      throw new OrderValidationError('Customer ID is required');
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      throw new OrderValidationError('Order must contain at least one item');
    }
    
    // Create order instance
    const order = new Order(orderData);
    order.id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total amount
    order.totalAmount = orderData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
    
    return order;
  }
  
  static async findById(id: string): Promise<Order> {
    // Mock implementation for GREEN phase
    const order = new Order({
      customerId: 'user123'
    });
    order.id = id;
    return order;
  }
  
  static async findByCustomerId(customerId: string): Promise<Order[]> {
    // Mock implementation for GREEN phase
    const order1 = new Order({ customerId });
    order1.id = 'order1';
    const order2 = new Order({ customerId });
    order2.id = 'order2';
    return [order1, order2];
  }
  
  static async findByStatus(status: OrderStatus): Promise<Order[]> {
    // Mock implementation for GREEN phase
    const order = new Order({ customerId: 'user123' });
    order.id = 'order1';
    order.status = status;
    return [order];
  }
  
  static async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    // Mock implementation for GREEN phase
    const order = new Order({ customerId: 'user123' });
    order.id = 'order1';
    return [order];
  }
  
  static async getAnalytics(params: { startDate: Date; endDate: Date }): Promise<OrderAnalytics> {
    // Mock implementation for GREEN phase
    return {
      totalOrders: 100,
      totalRevenue: 50000,
      averageOrderValue: 500,
      ordersByStatus: {
        [OrderStatus.PENDING]: 10,
        [OrderStatus.CONFIRMED]: 20,
        [OrderStatus.DELIVERED]: 70
      },
      topCustomers: [
        { customerId: 'user1', orderCount: 15, totalSpent: 7500 },
        { customerId: 'user2', orderCount: 12, totalSpent: 6000 }
      ]
    };
  }
  
  // Cart management methods (GREEN phase - minimal implementation)
  async addItem(sweetId: string, quantity: number, unitPrice: number): Promise<void> {
    // Check if item already exists
    const existingItemIndex = this.items.findIndex(item => item.sweetId === sweetId);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = this.items[existingItemIndex];
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      }
    } else {
      // Add new item
      this.items.push({
        sweetId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });
    }
    
    this.updateTotalAmount();
  }
  
  async updateItemQuantity(sweetId: string, quantity: number): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.sweetId === sweetId);
    
    if (itemIndex >= 0) {
      const item = this.items[itemIndex];
      if (item) {
        item.quantity = quantity;
        item.totalPrice = quantity * item.unitPrice;
        this.updateTotalAmount();
      }
    }
  }
  
  async removeItem(sweetId: string): Promise<void> {
    this.items = this.items.filter(item => item.sweetId !== sweetId);
    this.updateTotalAmount();
  }
  
  async clearCart(): Promise<void> {
    this.items = [];
    this.totalAmount = 0;
  }
  
  getItem(sweetId: string): OrderItem {
    const item = this.items.find(item => item.sweetId === sweetId);
    if (!item) {
      throw new Error('Item not found in order');
    }
    return item;
  }
  
  // Financial methods (GREEN phase - minimal implementation)
  getTotalAmount(): number {
    return this.totalAmount;
  }
  
  getFinalAmount(): number {
    return this.totalAmount - this.discountAmount + this.taxAmount;
  }
  
  async applyDiscount(code: string, percentage: number): Promise<void> {
    this.discountCode = code;
    this.discountAmount = (this.totalAmount * percentage) / 100;
  }
  
  async calculateTax(): Promise<void> {
    // Simple tax calculation (5% GST)
    this.taxRate = 5;
    this.taxAmount = (this.totalAmount * this.taxRate) / 100;
  }
  
  // Helper method to update total amount
  private updateTotalAmount(): void {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }
  
  // Status management methods (GREEN phase - minimal implementation)
  async confirmOrder(): Promise<void> {
    this.status = OrderStatus.CONFIRMED;
    this.confirmedAt = new Date();
  }
  
  async startPreparing(): Promise<void> {
    this.status = OrderStatus.PREPARING;
    this.preparingStartedAt = new Date();
  }
  
  async markReady(): Promise<void> {
    this.status = OrderStatus.READY;
    this.readyAt = new Date();
  }
  
  async markDelivered(): Promise<void> {
    this.status = OrderStatus.DELIVERED;
    this.deliveredAt = new Date();
  }
  
  async cancelOrder(reason: string): Promise<void> {
    this.status = OrderStatus.CANCELLED;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
  }
  
  // Payment methods (GREEN phase - minimal implementation)
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // Simple mock payment processing
    if (paymentData.cardToken === 'invalid_token') {
      this.paymentStatus = PaymentStatus.FAILED;
      return {
        success: false,
        errorMessage: 'Invalid payment token'
      };
    }
    
    // Simulate successful payment
    this.paymentStatus = PaymentStatus.PAID;
    this.paymentMethod = paymentData.method;
    this.paidAt = new Date();
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  async processRefund(): Promise<RefundResult> {
    // Simple mock refund processing
    this.paymentStatus = PaymentStatus.REFUNDED;
    this.refundedAt = new Date();
    
    return {
      success: true,
      refundId: `rfnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  // Delivery methods (GREEN phase - minimal implementation)
  async assignDeliveryPartner(partnerId: string): Promise<void> {
    this.deliveryPartnerId = partnerId;
    this.deliveryStatus = DeliveryStatus.ASSIGNED;
  }
  
  async updateDeliveryStatus(status: DeliveryStatus): Promise<void> {
    this.deliveryStatus = status;
  }
  
  async calculateEstimatedDeliveryTime(): Promise<Date> {
    // Simple calculation: 2 hours from now
    const estimatedTime = new Date();
    estimatedTime.setHours(estimatedTime.getHours() + 2);
    return estimatedTime;
  }
}