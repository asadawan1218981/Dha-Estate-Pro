const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    coverImage: { type: String, required: true },
    isFeatured: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
