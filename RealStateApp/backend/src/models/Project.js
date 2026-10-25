const mongoose = require('mongoose');
const { DHA_PHASES } = require('../../../shared/constants');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    phase: {
      type: String,
      enum: DHA_PHASES,
      required: true,
      index: true
    },
    images: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ['Off-Plan', 'Under Construction', 'Completed'],
      required: true,
      index: true
    },
    priceStarting: { type: String, required: true },
    areaRange: { type: String, required: true },
    isFeatured: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
