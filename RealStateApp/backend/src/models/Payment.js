const mongoose = require('mongoose');

// Payment record. This is a SANDBOX workflow only: no real payment
// gateway is integrated (no credentials configured). A payment starts
// as Pending and is only marked Confirmed through the explicit sandbox
// confirm endpoint. Receipts are generated only for Confirmed payments.
// Never store raw card details.
const PaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Payment amount must be positive']
    },
    currency: { type: String, default: 'PKR' },
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card (Sandbox)', 'Other'],
      default: 'Cash'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true
    },
    provider: { type: String, default: 'SANDBOX' },
    providerRef: { type: String },
    receiptNo: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
