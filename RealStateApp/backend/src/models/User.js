const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'OWNER', 'AGENT', 'ADMIN'], default: 'USER', required: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
  },
  { timestamps: true }
);

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
