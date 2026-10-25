const mongoose = require('mongoose');

// Property viewing / appointment.
// Availability conflicts are checked on the server before confirming:
// two active viewings (Requested/Confirmed) may not overlap the same
// property or the same agent within the same hour window.
const ViewingSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    dateTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['Requested', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Requested',
      index: true
    },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

ViewingSchema.index({ property: 1, dateTime: 1 });
ViewingSchema.index({ agent: 1, dateTime: 1 });

module.exports = mongoose.model('Viewing', ViewingSchema);
