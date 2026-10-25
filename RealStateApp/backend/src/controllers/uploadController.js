const fs = require('fs');
const path = require('path');

// Local image upload (no new dependencies).
// Accepts a base64 image (data URL or raw base64) and stores it under
// backend/uploads/, served statically at /uploads/<file>.
// Hard limit: images must be less than 100 KB — enforced here on the
// server, not just in the browser.
const MAX_IMAGE_BYTES = 100 * 1024; // 100 KB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const uploadImage = (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(data.trim());
    const mime = match ? match[1].toLowerCase() : 'image/jpeg';
    const base64 = match ? match[2] : data.trim();

    if (!ALLOWED_MIME.has(mime)) {
      return res.status(400).json({ message: 'Only JPG, PNG, WebP or GIF images are allowed' });
    }

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) {
      return res.status(400).json({ message: 'Invalid image data' });
    }
    if (buffer.length >= MAX_IMAGE_BYTES) {
      return res.status(413).json({
        message: `Image should be less than 100 KB (uploaded: ${(buffer.length / 1024).toFixed(1)} KB)`
      });
    }

    const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
    const safeBase = String(filename || 'property')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase || 'image'}.${ext}`;

    const uploadDir = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, uniqueName), buffer);

    res.status(201).json({
      url: `/uploads/${uniqueName}`,
      sizeKB: Number((buffer.length / 1024).toFixed(1))
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

module.exports = { uploadImage, MAX_IMAGE_BYTES };
