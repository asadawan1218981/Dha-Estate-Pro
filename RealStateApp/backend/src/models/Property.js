const mongoose = require('mongoose');
const {
  PROPERTY_TYPES,
  LISTING_STATUSES,
  DHA_PHASES,
  POSSESSION_STATUSES,
  FURNISHED_STATUSES
} = require('../../../shared/constants');

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    area: { type: String, required: true },
    type: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      required: true,
      index: true
    },
    beds: { type: Number },
    baths: { type: Number },
    location: { type: String, required: true, index: true },
    phase: {
      type: String,
      enum: DHA_PHASES,
      required: true,
      index: true
    },
    possessionStatus: {
      type: String,
      enum: POSSESSION_STATUSES,
      required: true,
      index: true
    },
    furnished: {
      type: String,
      enum: FURNISHED_STATUSES,
      required: true,
      index: true
    },
    images: [{ type: String, required: true }],
    videoUrl: { type: String },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    // Admin verification workflow. Public listings only show Approved
    // properties; Pending/Rejected listings are visible to their owner
    // (the `agent` field) and to ADMIN users only.
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    rejectionReason: { type: String, trim: true }
  },
  { timestamps: true }
);

// Search index for advanced keyword searching
PropertySchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Property', PropertySchema);
