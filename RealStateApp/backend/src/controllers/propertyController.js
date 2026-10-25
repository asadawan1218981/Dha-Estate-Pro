const Property = require('../models/Property');
const User = require('../models/User');
const {
  PROPERTY_TYPES,
  LISTING_STATUSES,
  DHA_PHASES,
  POSSESSION_STATUSES,
  FURNISHED_STATUSES
} = require('../../../shared/constants');

const PROPERTY_TYPE_ALIASES = {
  HOUSES: 'HOUSE',
  APARTMENTS: 'APARTMENT',
  PORTIONS: 'PORTION',
  PLOTS: 'PLOT',
  OFFICES: 'OFFICE',
  SHOPS: 'SHOP',
  COMMERCIALS: 'COMMERCIAL'
};

const normalizeEnum = (value, allowedValues, aliases = {}) => {
  if (typeof value !== 'string') return '';

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const canonical = aliases[normalized] || normalized;

  return allowedValues.includes(canonical) ? canonical : '';
};

const parsePositiveInteger = (value, fallback, max) => {
  if (value === undefined || value === '') return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return null;

  return Math.min(parsed, max);
};

const parsePrice = (value) => {
  if (value === undefined || value === '') return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const getProperties = async (req, res) => {
  try {
    const {
      status,
      type,
      phase,
      priceMin,
      priceMax,
      beds,
      baths,
      possessionStatus,
      furnished,
      query,
      isFeatured,
      limit = 12,
      page = 1
    } = req.query;

    const filter = {};
    const normalizedStatus = normalizeEnum(status, LISTING_STATUSES);
    const normalizedType = normalizeEnum(type, PROPERTY_TYPES, PROPERTY_TYPE_ALIASES);
    const normalizedLimit = parsePositiveInteger(limit, 12, 100);
    const requestedPage = parsePositiveInteger(page, 1, Number.MAX_SAFE_INTEGER);
    const minPrice = parsePrice(priceMin);
    const maxPrice = parsePrice(priceMax);

    if (status && !normalizedStatus) {
      return res.status(400).json({ message: 'Invalid status filter. Use BUY or RENT.' });
    }

    if (type && !normalizedType) {
      return res.status(400).json({ message: 'Invalid property type filter.' });
    }

    if (!normalizedLimit || !requestedPage) {
      return res.status(400).json({ message: 'Page and limit must be positive integers.' });
    }

    if (minPrice === null || maxPrice === null || (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) {
      return res.status(400).json({ message: 'Invalid price range.' });
    }

    // Filter by status (BUY/RENT)
    if (normalizedStatus) {
      filter.status = normalizedStatus;
    }

    // Filter by property type
    if (normalizedType) {
      filter.type = normalizedType;
    }

    // Filter by phase
    if (phase) {
      if (!DHA_PHASES.includes(phase)) {
        return res.status(400).json({ message: 'Invalid DHA phase filter.' });
      }
      filter.phase = phase;
    }

    // Filter by beds & baths
    if (beds) {
      const parsedBeds = parsePositiveInteger(beds, null, 100);
      if (!parsedBeds) {
        return res.status(400).json({ message: 'Beds must be a positive integer.' });
      }
      filter.beds = parsedBeds >= 5 ? { $gte: parsedBeds } : parsedBeds;
    }
    if (baths) {
      const parsedBaths = parsePositiveInteger(baths, null, 100);
      if (!parsedBaths) {
        return res.status(400).json({ message: 'Baths must be a positive integer.' });
      }
      filter.baths = parsedBaths >= 5 ? { $gte: parsedBaths } : parsedBaths;
    }

    // Filter by possession and furnished status
    if (possessionStatus) {
      if (!POSSESSION_STATUSES.includes(possessionStatus)) {
        return res.status(400).json({ message: 'Invalid possession status filter.' });
      }
      filter.possessionStatus = possessionStatus;
    }
    if (furnished) {
      if (!FURNISHED_STATUSES.includes(furnished)) {
        return res.status(400).json({ message: 'Invalid furnished status filter.' });
      }
      filter.furnished = furnished;
    }

    // Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Featured property filter
    if (isFeatured !== undefined) {
      if (isFeatured !== 'true' && isFeatured !== 'false') {
        return res.status(400).json({ message: 'isFeatured must be true or false.' });
      }
      filter.isFeatured = isFeatured === 'true';
    }

    // Verification visibility (admin approval workflow).
    // Public browsing shows Approved listings only. Owners/agents manage
    // their own listings via scope=mine; admins use scope=all.
    const scope = req.query.scope;
    if (scope === 'mine') {
      if (!req.user) {
        return res.status(401).json({ message: 'Login required to view your listings' });
      }
      filter.agent = req.user._id;
    } else if (scope === 'all') {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }
    } else {
      filter.verificationStatus = 'Approved';
    }

    // Text query search
    const searchQuery = typeof query === 'string' ? query.trim() : '';
    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    const itemsPerPage = normalizedLimit;
    const totalCount = await Property.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);
    const currentPage = Math.min(requestedPage, totalPages);
    const skipAmount = (currentPage - 1) * itemsPerPage;

    // Execute the page query only after clamping a stale page to the available range.
    const properties = await Property.find(filter)
      .populate('agent', 'name email phone avatar role')
      .sort(searchQuery ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skipAmount)
      .limit(itemsPerPage);

    res.json({
      properties,
      totalPages,
      currentPage,
      totalCount
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate('agent', 'name email phone avatar role');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Unverified listings are hidden from everyone except their owner and admins.
    const isOwnerOrAdmin =
      req.user &&
      (req.user.role === 'ADMIN' || property.agent._id.toString() === req.user._id.toString());
    if (property.verificationStatus !== 'Approved' && !isOwnerOrAdmin) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Count the view only for visible listings, in a single atomic update.
    property.views = (property.views || 0) + 1;
    await property.save();

    res.json({ property });
  } catch (error) {
    console.error('Get property detail error:', error);
    res.status(500).json({ message: 'Failed to load property details' });
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      area,
      type,
      status,
      beds,
      baths,
      location,
      phase,
      possessionStatus,
      furnished,
      images,
      videoUrl,
      isFeatured
    } = req.body;

    const cleanedImages = images && images.length ? images.filter(Boolean) : [];

    const newProperty = await Property.create({
      title,
      description,
      price: parseFloat(price),
      area,
      type,
      status,
      beds: beds ? parseInt(beds) : undefined,
      baths: baths ? parseInt(baths) : undefined,
      location,
      phase,
      possessionStatus,
      furnished,
      images: cleanedImages.length ? cleanedImages : ['/images/property-default.jpg'],
      videoUrl,
      agent: req.user._id,
      isFeatured: isFeatured || false,
      // Admin-created listings are approved immediately; everyone else
      // submits for admin verification first.
      verificationStatus: req.user.role === 'ADMIN' ? 'Approved' : 'Pending'
    });

    res.status(201).json({
      message: 'Property created successfully',
      property: newProperty
    });
  } catch (error) {
    console.error('Create property error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation Error: ${messages}` });
    }
    res.status(500).json({ message: error.message || 'Failed to create listing' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Role safety check: agent must be the owner, or user must be an admin
    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const updates = req.body;

    // Only admins may change verification state.
    if (req.user.role !== 'ADMIN') {
      delete updates.verificationStatus;
      delete updates.rejectionReason;
    }

    // Whitelisted updates
    const fieldsToUpdate = [
      'title', 'description', 'price', 'area', 'type', 'status',
      'beds', 'baths', 'location', 'phase', 'possessionStatus',
      'furnished', 'images', 'videoUrl', 'isFeatured',
      'verificationStatus', 'rejectionReason'
    ];

    fieldsToUpdate.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === 'images' && Array.isArray(updates[field])) {
          property[field] = updates[field].filter(Boolean);
        } else {
          property[field] = updates[field];
        }
      }
    });

    await property.save();

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Update property error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation Error: ${messages}` });
    }
    res.status(500).json({ message: error.message || 'Failed to update listing' });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Property.findByIdAndDelete(id);

    res.json({ message: 'Property listing deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
};

const getAgentAnalytics = async (req, res) => {
  try {
    const agentId = req.user._id;

    const properties = await Property.find({ agent: agentId });
    const totalListings = properties.length;
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLeads = properties.reduce((sum, p) => sum + (p.leadsCount || 0), 0);

    const listingsSummary = properties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      views: p.views || 0,
      leads: p.leadsCount || 0
    }));

    res.json({
      analytics: {
        totalListings,
        totalViews,
        totalLeads,
        listingsSummary
      }
    });
  } catch (error) {
    console.error('Agent analytics error:', error);
    res.status(500).json({ message: 'Failed to retrieve agent statistics' });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const User = require('../models/User');
    const Lead = require('../models/Lead');
    const Project = require('../models/Project');

    const totalUsers = await User.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const totalProjects = await Project.countDocuments();

    const properties = await Property.find({});
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);

    // Distribution by phase
    const phaseStats = await Property.aggregate([
      { $group: { _id: '$phase', count: { $sum: 1 } } }
    ]);

    // Distribution by status
    const statusStats = await Property.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      analytics: {
        totalProperties,
        totalUsers,
        totalLeads,
        totalProjects,
        totalViews,
        phaseStats,
        statusStats
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Failed to retrieve admin analytics' });
  }
};

const verifyProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Verification status must be Approved or Rejected' });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.verificationStatus = verificationStatus;
    property.rejectionReason = verificationStatus === 'Rejected' ? (rejectionReason || '') : '';
    await property.save();

    res.json({
      message: `Listing ${verificationStatus.toLowerCase()} successfully`,
      property
    });
  } catch (error) {
    console.error('Verify property error:', error);
    res.status(500).json({ message: 'Failed to verify listing' });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
  getAgentAnalytics,
  getAdminAnalytics
};
