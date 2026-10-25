const Payment = require('../models/Payment');
const Property = require('../models/Property');

// SANDBOX ONLY: no real payment gateway is integrated. Payments are
// recorded as Pending and must be explicitly confirmed through the
// sandbox endpoint. Receipts exist only for Confirmed payments.
const createPayment = async (req, res) => {
  try {
    const { propertyId, amount, method } = req.body;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be positive' });
    }

    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
    }

    const payment = await Payment.create({
      user: req.user._id,
      property: propertyId || undefined,
      amount: parsedAmount,
      method: method || 'Cash',
      status: 'Pending',
      provider: 'SANDBOX'
    });

    res.status(201).json({
      message: 'Sandbox payment recorded as Pending (no real money moved)',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid payment data' });
    }
    res.status(500).json({ message: 'Failed to record payment' });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('property', 'title price location')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Failed to load payments' });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('user', 'name email')
      .populate('property', 'title price location')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({ message: 'Failed to load payments' });
  }
};

// Sandbox confirmation: only the payment owner or an ADMIN, and only
// from Pending. Generates the receipt number at confirmation time.
const confirmSandboxPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const isOwner = payment.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    if (payment.status !== 'Pending') {
      return res.status(400).json({ message: `Only Pending payments can be confirmed (current: ${payment.status})` });
    }

    payment.status = 'Confirmed';
    payment.providerRef = `SANDBOX-${Date.now()}`;
    payment.receiptNo = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await payment.save();

    res.json({
      message: 'Sandbox payment confirmed (no real money moved)',
      payment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

// Mark a payment Failed (owner/admin, from Pending) or Refunded (admin,
// from Confirmed). Receipts are never generated for these states.
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const isOwner = payment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (status === 'Failed') {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      if (payment.status !== 'Pending') {
        return res.status(400).json({ message: 'Only Pending payments can be marked Failed' });
      }
      payment.status = 'Failed';
    } else if (status === 'Refunded') {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only an admin can mark a payment Refunded' });
      }
      if (payment.status !== 'Confirmed') {
        return res.status(400).json({ message: 'Only Confirmed payments can be refunded' });
      }
      payment.status = 'Refunded';
    } else {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    await payment.save();
    res.json({ message: `Payment marked ${payment.status}`, payment });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getAdminPayments,
  confirmSandboxPayment,
  updatePaymentStatus
};
