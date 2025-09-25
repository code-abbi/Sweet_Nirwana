/**
 * Order Model - REFACTOR Phase Implementation
 * 
 * Implemented using Test-Driven Development (TDD):
 * ✅ RED Phase: Tests written first (failing)
 * ✅ GREEN Phase: Implementation to make tests pass  
 * 🔄 REFACTOR Phase: Clean, maintainable code with proper database integration
 * 
 * Note: This model works with our 'transactions' table which represents order transactions
 */

import { Transaction as TransactionSchema, NewTransaction, transactions } from './schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { Sweet } from './Sweet';

// Custom error classes for better error handling
export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order (transaction) with ID ${id} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class OrderStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderStatusError';
  }
}

// Enums for Order-related statuses (simplified for our transaction-based model)
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
 * Order Model Class - REFACTOR Phase
 * 
 * This class represents an order in the sweet shop system using transactions.
 * It handles order creation, status management, payments, and delivery tracking.
 * Refactored for clean database integration and proper error handling.
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
      this.calculateTotalAmount();
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
  
  /**
   * REFACTOR Phase: Create a new order (transaction) with proper validation
   */
  static async create(orderData: OrderData): Promise<Order> {
    try {
      // Validate input data
      this.validateOrderData(orderData);
      
      const order = new Order(orderData);
      
      // If order has items, create transactions for each item
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          // Validate sweet exists and has sufficient stock
          const sweet = await Sweet.findById(item.sweetId);
          if (!sweet) {
            throw new OrderValidationError(`Sweet with ID ${item.sweetId} not found`);
          }
          
          if (sweet.quantity < item.quantity) {
            throw new OrderValidationError(`Insufficient stock for ${sweet.name}: ${sweet.quantity} available, ${item.quantity} requested`);
          }
          
          // Create transaction record
          await db.insert(transactions).values({
            sweetId: item.sweetId,
            userId: order.customerId,
            type: 'purchase',
            quantity: item.quantity,
            price: item.unitPrice.toString()
          });
          
          // Reduce sweet stock
          await Sweet.reduceStock(item.sweetId, item.quantity);
        }
      }
      
      return order;
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Find transactions by user ID (representing their orders)
   */
  static async findById(id: string): Promise<Order | null> {
    try {
      // In our simplified model, we find the transaction by ID
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
      
      if (!transaction) {
        return null;
      }
      
      // Convert transaction to Order format
      return this.transactionToOrder(transaction);
    } catch (error) {
      throw new Error(`Failed to find order by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Find all orders for a customer
   */
  static async findByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const customerTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, customerId))
        .orderBy(desc(transactions.timestamp));
      
      // Group transactions into orders (simplified: each transaction is an order)
      return customerTransactions.map(transaction => this.transactionToOrder(transaction));
    } catch (error) {
      throw new Error(`Failed to find orders by customer ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Find orders by status (simplified implementation)
   */
  static async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      // In our simplified model, we assume all transactions are completed orders
      // This is a simplified implementation for the basic transaction structure
      const allTransactions = await db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.timestamp));
      
      const orders = allTransactions.map(transaction => this.transactionToOrder(transaction));
      
      // Filter by status (for this refactor, we'll return all as 'delivered')
      return orders.filter(order => order.status === status);
    } catch (error) {
      throw new Error(`Failed to find orders by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Find orders by date range
   */
  static async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const rangeTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            gte(transactions.timestamp, startDate),
            lte(transactions.timestamp, endDate)
          )
        )
        .orderBy(desc(transactions.timestamp));
      
      return rangeTransactions.map(transaction => this.transactionToOrder(transaction));
    } catch (error) {
      throw new Error(`Failed to find orders by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Get analytics for orders
   */
  static async getAnalytics(params: { startDate: Date; endDate: Date }): Promise<OrderAnalytics> {
    try {
      const orders = await this.findByDateRange(params.startDate, params.endDate);
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Count orders by status
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Top customers analysis
      const customerSpending = orders.reduce((acc, order) => {
        acc[order.customerId] = (acc[order.customerId] || 0) + order.totalAmount;
        return acc;
      }, {} as Record<string, number>);
      
      const topCustomers = Object.entries(customerSpending)
        .map(([customerId, totalSpent]) => ({
          customerId,
          orderCount: orders.filter(o => o.customerId === customerId).length,
          totalSpent
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        topCustomers
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Add item to order with validation
   */
  async addItem(sweetId: string, quantity: number, unitPrice: number): Promise<void> {
    try {
      // Validate inputs
      this.validateItemInputs(sweetId, quantity, unitPrice);
      
      // Check if sweet exists and has sufficient stock
      const sweet = await Sweet.findById(sweetId);
      if (!sweet) {
        throw new OrderValidationError(`Sweet with ID ${sweetId} not found`);
      }
      
      if (sweet.quantity < quantity) {
        throw new OrderValidationError(`Insufficient stock for ${sweet.name}: ${sweet.quantity} available, ${quantity} requested`);
      }
      
      // Check if item already exists in order
      const existingItem = this.items.find(item => item.sweetId === sweetId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        this.items.push({
          sweetId,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice
        });
      }
      
      this.calculateTotalAmount();
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Update item quantity with validation
   */
  async updateItemQuantity(sweetId: string, quantity: number): Promise<void> {
    try {
      this.validateQuantity(quantity, 'update');
      
      const item = this.items.find(item => item.sweetId === sweetId);
      if (!item) {
        throw new OrderValidationError(`Item with sweet ID ${sweetId} not found in order`);
      }
      
      // Validate stock availability
      const sweet = await Sweet.findById(sweetId);
      if (!sweet) {
        throw new OrderValidationError(`Sweet with ID ${sweetId} not found`);
      }
      
      if (sweet.quantity < quantity) {
        throw new OrderValidationError(`Insufficient stock for ${sweet.name}: ${sweet.quantity} available, ${quantity} requested`);
      }
      
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.unitPrice;
      
      this.calculateTotalAmount();
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to update item quantity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Remove item from order
   */
  async removeItem(sweetId: string): Promise<void> {
    try {
      const itemIndex = this.items.findIndex(item => item.sweetId === sweetId);
      
      if (itemIndex === -1) {
        throw new OrderValidationError(`Item with sweet ID ${sweetId} not found in order`);
      }
      
      this.items.splice(itemIndex, 1);
      this.calculateTotalAmount();
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Clear all items from cart
   */
  async clearCart(): Promise<void> {
    this.items = [];
    this.totalAmount = 0;
  }
  
  /**
   * REFACTOR Phase: Get specific item from order
   */
  getItem(sweetId: string): OrderItem | null {
    const item = this.items.find(item => item.sweetId === sweetId);
    return item || null;
  }
  
  /**
   * REFACTOR Phase: Calculate total amount
   */
  getTotalAmount(): number {
    return this.items.reduce((total, item) => total + (item.totalPrice || 0), 0);
  }
  
  /**
   * REFACTOR Phase: Get final amount after discounts and tax
   */
  getFinalAmount(): number {
    const subtotal = this.getTotalAmount();
    const afterDiscount = subtotal - this.discountAmount;
    const finalAmount = afterDiscount + this.taxAmount;
    return Math.max(0, finalAmount); // Ensure non-negative
  }
  
  /**
   * REFACTOR Phase: Apply discount with validation
   */
  async applyDiscount(code: string, percentage: number): Promise<void> {
    try {
      this.validateDiscountInputs(code, percentage);
      
      this.discountCode = code;
      const subtotal = this.getTotalAmount();
      this.discountAmount = (subtotal * percentage) / 100;
      
      // Ensure discount doesn't exceed subtotal
      this.discountAmount = Math.min(this.discountAmount, subtotal);
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to apply discount: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Calculate tax
   */
  async calculateTax(): Promise<void> {
    const taxRate = this.taxRate || 0.08; // Default 8% tax rate
    const subtotal = this.getTotalAmount() - this.discountAmount;
    this.taxAmount = subtotal * taxRate;
    this.taxRate = taxRate;
  }
  
  /**
   * REFACTOR Phase: Confirm order with validation
   */
  async confirmOrder(): Promise<void> {
    try {
      if (this.status !== OrderStatus.PENDING) {
        throw new OrderStatusError(`Order cannot be confirmed. Current status: ${this.status}`);
      }
      
      if (this.items.length === 0) {
        throw new OrderValidationError('Cannot confirm order with no items');
      }
      
      this.status = OrderStatus.CONFIRMED;
      this.confirmedAt = new Date();
    } catch (error) {
      if (error instanceof OrderStatusError || error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to confirm order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Start preparing order
   */
  async startPreparing(): Promise<void> {
    try {
      if (this.status !== OrderStatus.CONFIRMED) {
        throw new OrderStatusError(`Order must be confirmed before preparing. Current status: ${this.status}`);
      }
      
      this.status = OrderStatus.PREPARING;
      this.preparingStartedAt = new Date();
    } catch (error) {
      if (error instanceof OrderStatusError) {
        throw error;
      }
      throw new Error(`Failed to start preparing order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Mark order as ready
   */
  async markReady(): Promise<void> {
    try {
      if (this.status !== OrderStatus.PREPARING) {
        throw new OrderStatusError(`Order must be in preparing status to mark ready. Current status: ${this.status}`);
      }
      
      this.status = OrderStatus.READY;
      this.readyAt = new Date();
    } catch (error) {
      if (error instanceof OrderStatusError) {
        throw error;
      }
      throw new Error(`Failed to mark order ready: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Mark order as delivered
   */
  async markDelivered(): Promise<void> {
    try {
      if (this.status !== OrderStatus.READY) {
        throw new OrderStatusError(`Order must be ready to mark delivered. Current status: ${this.status}`);
      }
      
      this.status = OrderStatus.DELIVERED;
      this.deliveredAt = new Date();
      this.deliveryStatus = DeliveryStatus.DELIVERED;
    } catch (error) {
      if (error instanceof OrderStatusError) {
        throw error;
      }
      throw new Error(`Failed to mark order delivered: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Cancel order with reason
   */
  async cancelOrder(reason: string): Promise<void> {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new OrderValidationError('Cancellation reason is required');
      }
      
      if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(this.status)) {
        throw new OrderStatusError(`Order cannot be cancelled. Current status: ${this.status}`);
      }
      
      // Save the previous status before changing it
      const previousStatus = this.status;
      
      this.status = OrderStatus.CANCELLED;
      this.cancelledAt = new Date();
      this.cancellationReason = reason.trim();
      
      // If order was confirmed, restore stock
      if (previousStatus === OrderStatus.CONFIRMED || previousStatus === OrderStatus.PREPARING || previousStatus === OrderStatus.READY) {
        for (const item of this.items) {
          await Sweet.increaseStock(item.sweetId, item.quantity);
        }
      }
    } catch (error) {
      if (error instanceof OrderStatusError || error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Process payment (simplified implementation)
   */
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      this.validatePaymentData(paymentData);
      
      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate for testing
      
      if (success) {
        this.paymentStatus = PaymentStatus.PAID;
        this.paidAt = new Date();
        this.paymentMethod = paymentData.method;
        
        return {
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        this.paymentStatus = PaymentStatus.FAILED;
        
        return {
          success: false,
          errorMessage: 'Payment processing failed. Please try again.'
        };
      }
    } catch (error) {
      this.paymentStatus = PaymentStatus.FAILED;
      
      if (error instanceof OrderValidationError) {
        return {
          success: false,
          errorMessage: error.message
        };
      }
      
      return {
        success: false,
        errorMessage: `Payment processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * REFACTOR Phase: Process refund (simplified implementation)
   */
  async processRefund(): Promise<RefundResult> {
    try {
      if (this.paymentStatus !== PaymentStatus.PAID) {
        throw new OrderStatusError(`Order must be paid to process refund. Payment status: ${this.paymentStatus}`);
      }
      
      // Simulate refund processing
      const success = Math.random() > 0.05; // 95% success rate for testing
      
      if (success) {
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.refundedAt = new Date();
        
        return {
          success: true,
          refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        return {
          success: false,
          errorMessage: 'Refund processing failed. Please contact support.'
        };
      }
    } catch (error) {
      if (error instanceof OrderStatusError) {
        return {
          success: false,
          errorMessage: error.message
        };
      }
      
      return {
        success: false,
        errorMessage: `Refund processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * REFACTOR Phase: Assign delivery partner
   */
  async assignDeliveryPartner(partnerId: string): Promise<void> {
    try {
      if (!partnerId || partnerId.trim().length === 0) {
        throw new OrderValidationError('Delivery partner ID is required');
      }
      
      if (this.status !== OrderStatus.READY) {
        throw new OrderStatusError(`Order must be ready to assign delivery partner. Current status: ${this.status}`);
      }
      
      this.deliveryPartnerId = partnerId.trim();
      this.deliveryStatus = DeliveryStatus.ASSIGNED;
    } catch (error) {
      if (error instanceof OrderStatusError || error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to assign delivery partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Update delivery status
   */
  async updateDeliveryStatus(status: DeliveryStatus): Promise<void> {
    try {
      if (!Object.values(DeliveryStatus).includes(status)) {
        throw new OrderValidationError(`Invalid delivery status: ${status}`);
      }
      
      this.deliveryStatus = status;
      
      if (status === DeliveryStatus.DELIVERED) {
        await this.markDelivered();
      }
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }
      throw new Error(`Failed to update delivery status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * REFACTOR Phase: Calculate estimated delivery time
   */
  async calculateEstimatedDeliveryTime(): Promise<Date> {
    const basePreparationTime = 30; // 30 minutes
    const itemPreparationTime = this.items.length * 5; // 5 minutes per item
    const deliveryTime = 45; // 45 minutes for delivery
    
    const totalMinutes = basePreparationTime + itemPreparationTime + deliveryTime;
    
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + totalMinutes);
    
    return estimatedTime;
  }
  
  // Private helper methods for REFACTOR phase
  
  /**
   * REFACTOR Phase: Convert transaction to Order object (simplified mapping)
   */
  private static transactionToOrder(transaction: TransactionSchema): Order {
    const orderData: OrderData = {
      customerId: transaction.userId,
      items: [{
        sweetId: transaction.sweetId,
        quantity: transaction.quantity,
        unitPrice: parseFloat(transaction.price || '0'),
        totalPrice: transaction.quantity * parseFloat(transaction.price || '0')
      }]
    };
    
    const order = new Order(orderData);
    order.id = transaction.id;
    order.createdAt = transaction.timestamp;
    order.status = OrderStatus.DELIVERED; // Simplified: all transactions are considered delivered orders
    order.paymentStatus = PaymentStatus.PAID; // Simplified: all transactions are considered paid
    order.deliveryStatus = DeliveryStatus.DELIVERED;
    
    return order;
  }
  
  /**
   * REFACTOR Phase: Calculate and update total amount
   */
  private calculateTotalAmount(): void {
    this.totalAmount = this.getTotalAmount();
  }
  
  /**
   * REFACTOR Phase: Validate order creation data
   */
  private static validateOrderData(orderData: OrderData): void {
    const errors: string[] = [];
    
    if (!orderData.customerId || orderData.customerId.trim().length === 0) {
      errors.push('Customer ID is required');
    }
    
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach((item, index) => {
        if (!item.sweetId || item.sweetId.trim().length === 0) {
          errors.push(`Item ${index + 1}: Sweet ID is required`);
        }
        
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
        }
        
        if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
          errors.push(`Item ${index + 1}: Unit price must be a positive number`);
        }
      });
    }
    
    if (errors.length > 0) {
      throw new OrderValidationError(`Order validation failed: ${errors.join(', ')}`);
    }
  }
  
  /**
   * REFACTOR Phase: Validate item inputs
   */
  private validateItemInputs(sweetId: string, quantity: number, unitPrice: number): void {
    const errors: string[] = [];
    
    if (!sweetId || sweetId.trim().length === 0) {
      errors.push('Sweet ID is required');
    }
    
    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push('Quantity must be a positive integer');
    }
    
    if (typeof unitPrice !== 'number' || unitPrice <= 0) {
      errors.push('Unit price must be a positive number');
    }
    
    if (errors.length > 0) {
      throw new OrderValidationError(errors.join(', '));
    }
  }
  
  /**
   * REFACTOR Phase: Validate quantity for operations
   */
  private validateQuantity(quantity: number, operation: string): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new OrderValidationError(`Quantity for ${operation} must be a positive integer`);
    }
  }
  
  /**
   * REFACTOR Phase: Validate discount inputs
   */
  private validateDiscountInputs(code: string, percentage: number): void {
    const errors: string[] = [];
    
    if (!code || code.trim().length === 0) {
      errors.push('Discount code is required');
    }
    
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      errors.push('Discount percentage must be between 0 and 100');
    }
    
    if (errors.length > 0) {
      throw new OrderValidationError(errors.join(', '));
    }
  }
  
  /**
   * REFACTOR Phase: Validate payment data
   */
  private validatePaymentData(paymentData: PaymentData): void {
    const errors: string[] = [];
    
    if (!paymentData.method || paymentData.method.trim().length === 0) {
      errors.push('Payment method is required');
    }
    
    if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
      errors.push('Payment amount must be a positive number');
    }
    
    // Validate amount matches order total
    const expectedAmount = this.getFinalAmount();
    if (Math.abs(paymentData.amount - expectedAmount) > 0.01) {
      errors.push(`Payment amount (${paymentData.amount}) does not match order total (${expectedAmount})`);
    }
    
    if (errors.length > 0) {
      throw new OrderValidationError(errors.join(', '));
    }
  }
}