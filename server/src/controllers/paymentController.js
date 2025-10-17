import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import paypal from '../config/paypal.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res) => {
  const { amount, description, appointmentId } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Valid amount is required');
  }

  // Create payment record
  const payment = await Payment.create({
    userId: req.user.id,
    appointmentId,
    amount,
    description: description || 'Healthcare service payment',
    status: 'Pending',
  });

  // Create PayPal payment
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: `${process.env.CLIENT_URL}/payment/success?paymentId=${payment._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?paymentId=${payment._id}`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: description || 'Healthcare Service',
              sku: 'healthcare',
              price: amount.toFixed(2),
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: amount.toFixed(2),
        },
        description: description || 'Payment for healthcare services',
      },
    ],
  };

  paypal.payment.create(create_payment_json, async (error, paypalPayment) => {
    if (error) {
      console.error('PayPal Error:', error);
      payment.status = 'Failed';
      await payment.save();
      res.status(500);
      throw new Error('Error creating PayPal payment');
    } else {
      // Save PayPal payment ID
      payment.paypalPaymentId = paypalPayment.id;
      await payment.save();

      // Find approval URL
      const approvalUrl = paypalPayment.links.find(
        (link) => link.rel === 'approval_url'
      ).href;

      sendSuccess(res, {
        payment,
        approvalUrl,
      }, 201);
    }
  });
});

// @desc    Execute payment (after PayPal approval)
// @route   POST /api/payments/execute
// @access  Private
export const executePayment = asyncHandler(async (req, res) => {
  const { paymentId, PayerID } = req.body;

  if (!paymentId || !PayerID) {
    res.status(400);
    throw new Error('Payment ID and Payer ID are required');
  }

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to execute this payment');
  }

  const execute_payment_json = {
    payer_id: PayerID,
  };

  paypal.payment.execute(
    payment.paypalPaymentId,
    execute_payment_json,
    async (error, paypalPayment) => {
      if (error) {
        console.error('PayPal Execute Error:', error);
        payment.status = 'Failed';
        await payment.save();
        res.status(500);
        throw new Error('Error executing PayPal payment');
      } else {
        // Update payment status
        payment.status = 'Completed';
        payment.paypalPayerId = PayerID;
        payment.metadata = paypalPayment;
        await payment.save();

        sendSuccess(res, payment);
      }
    }
  );
});

// @desc    Get user's payments
// @route   GET /api/payments/me
// @access  Private
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id })
    .populate('appointmentId', 'date time reason')
    .sort('-createdAt');

  sendSuccess(res, payments);
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('appointmentId', 'date time reason');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Check authorization
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    payment.userId._id.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  sendSuccess(res, payment);
});

// @desc    Get all payments (Admin/Staff)
// @route   GET /api/payments/all
// @access  Private (Admin, Staff)
export const getAllPayments = asyncHandler(async (req, res) => {
  const { status, userId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (userId) query.userId = userId;

  const payments = await Payment.find(query)
    .populate('userId', 'name email')
    .populate('appointmentId', 'date time reason')
    .sort('-createdAt');

  sendSuccess(res, payments);
});

// @desc    Refund payment
// @route   POST /api/payments/refund/:id
// @access  Private (Admin, Staff)
export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.status !== 'Completed') {
    res.status(400);
    throw new Error('Only completed payments can be refunded');
  }

  // In a real implementation, you would call PayPal refund API here
  // For now, just update the status
  payment.status = 'Refunded';
  await payment.save();

  sendSuccess(res, payment);
});
