/**
 * Order Controller - Simplified for TDD API Implementation
 */

import { Request, Response } from 'express';
import { Order } from '../models/Order';

/**
 * Order Controller Object
 */
export const orderController = {
  /**
   * POST /api/orders - Create new order
   */
  createOrder: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const orderData = req.body;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Basic validation
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Order items are required'
        });
        return;
      }

      // Prepare order data with user info
      const completeOrderData = {
        ...orderData,
        customerId: user.userId,
        customerEmail: user.email
      };

      const order = await Order.create(completeOrderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating order'
      });
    }
  },

  /**
   * GET /api/orders - Get user orders
   */
  getUserOrders: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const orders = await Order.findByCustomerId(user.userId);

      res.json({
        success: true,
        data: {
          orders
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching orders'
      });
    }
  },

  /**
   * PUT /api/orders/:id/status - Update order status (admin only)
   */
  updateOrderStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      if (!user || user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }

      const order = await Order.findById(id);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Update order status (simplified - in real implementation would have proper update method)
      order.status = status;

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order
        }
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating order status'
      });
    }
  },

  /**
   * GET /api/orders/:id - Get order by ID
   */
  getOrderById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const order = await Order.findById(id);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check if user owns the order or is admin
      if (order.customerId !== user.userId && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          order
        }
      });
    } catch (error) {
      console.error('Get order by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching order'
      });
    }
  },

  /**
   * POST /api/orders/:id/payment - Process order payment
   */
  processPayment: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      const user = (req as any).user;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Basic payment validation
      if (!paymentData.amount || !paymentData.paymentMethod) {
        res.status(400).json({
          success: false,
          message: 'Payment amount and method are required'
        });
        return;
      }

      const order = await Order.findById(id);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check if user owns the order
      if (order.customerId !== user.userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Simulate payment processing
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real app, you would process the payment with a payment gateway here
      
      const payment = {
        transactionId,
        orderId: id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        status: 'completed',
        processedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          payment
        }
      });
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing payment'
      });
    }
  }
};