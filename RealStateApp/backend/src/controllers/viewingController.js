const Viewing = require('../models/Viewing');
const Property = require('../models/Property');

const ACTIVE_STATUSES = ['Requested', 'Confirmed'];

// A viewing occupies a 1-hour window starting at dateTime.
const hourWindow = (dateTime) => {
  const start = new Date(dateTime);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { start, end };
};

// Returns 'property' | 'agent' | null when a conflicting active viewing exists.
const findConflict = async ({ propertyId, agentId, dateTime, excludeId }) => {
  const { start, end } = hourWindow(dateTime);
  const base = {
    dateTime: { $gte: start, $lt: end },
    status: { $in: ACTIVE_STATUSES }
  };
  if (excludeId) base._id = { $ne: excludeId };

  const propertyConflict = await Viewing.findOne({ ...base, property: propertyId });
  if (propertyConflict) return 'property';

  if (agentId) {
    const agentConflict = await Viewing.findOne({ ...base, agent: agentId });
    if (agentConflict) return 'agent';
  }

  return null;
};

const createViewing = async (req, res) => {
  try {
    const { propertyId, dateTime, notes } = req.body;

    if (!propertyId || !dateTime) {
      return res.status(400).json({ message: 'Property and date/time are required' });
    }

    const when = new Date(dateTime);
    if (Number.isNaN(when.getTime()) || when.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Viewing date/time must be in the future' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Unverified listings cannot be booked for viewing (owners/admins excepted).
    const isOwnerOrAdmin =
      req.user.role === 'ADMIN' || property.agent.toString() === req.user._id.toString();
    if (property.verificationStatus !== 'Approved' && !isOwnerOrAdmin) {
      return res.status(400).json({ message: 'This listing is not approved for viewings yet' });
    }

    const conflict = await findConflict({
      propertyId,
      agentId: property.agent,
      dateTime: when
    });
    if (conflict === 'property') {
      return res.status(409).json({ message: 'This property already has a viewing in that hour' });
    }
    if (conflict === 'agent') {
      return res.status(409).json({ message: 'The assigned agent is busy in that hour' });
    }

    const viewing = await Viewing.create({
      buyer: req.user._id,
      property: propertyId,
      agent: property.agent,
      dateTime: when,
      notes
    });

    res.status(201).json({ message: 'Viewing requested successfully', viewing });
  } catch (error) {
    console.error('Create viewing error:', error);
    res.status(500).json({ message: 'Failed to request viewing' });
  }
};

const getMyViewings = async (req, res) => {
  try {
    const viewings = await Viewing.find({ buyer: req.user._id })
      .populate('property', 'title price location phase images verificationStatus')
      .populate('agent', 'name email phone')
      .sort({ dateTime: 1 });
    res.json({ viewings });
  } catch (error) {
    console.error('Get my viewings error:', error);
    res.status(500).json({ message: 'Failed to load viewings' });
  }
};

const getAgentViewings = async (req, res) => {
  try {
    const viewings = await Viewing.find({ agent: req.user._id })
      .populate('property', 'title price location phase images')
      .populate('buyer', 'name email phone')
      .sort({ dateTime: 1 });
    res.json({ viewings });
  } catch (error) {
    console.error('Get agent viewings error:', error);
    res.status(500).json({ message: 'Failed to load viewings' });
  }
};

const getAdminViewings = async (req, res) => {
  try {
    const viewings = await Viewing.find({})
      .populate('property', 'title price location phase images')
      .populate('buyer', 'name email phone')
      .populate('agent', 'name email phone')
      .sort({ dateTime: -1 });
    res.json({ viewings });
  } catch (error) {
    console.error('Get admin viewings error:', error);
    res.status(500).json({ message: 'Failed to load viewings' });
  }
};

const updateViewing = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dateTime, notes } = req.body;

    const viewing = await Viewing.findById(id);
    if (!viewing) {
      return res.status(404).json({ message: 'Viewing not found' });
    }

    const isBuyer = viewing.buyer.toString() === req.user._id.toString();
    const isAgent = viewing.agent && viewing.agent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isAgent && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Buyers may only cancel (or reschedule) their own viewing.
    if (isBuyer && !isAgent && !isAdmin) {
      if (status && status !== 'Cancelled' && status !== 'Rescheduled') {
        return res.status(403).json({ message: 'Buyers can only cancel or reschedule a viewing' });
      }
    }

    if (status) {
      if (!['Requested', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid viewing status' });
      }
      viewing.status = status;
    }

    if (dateTime) {
      const when = new Date(dateTime);
      if (Number.isNaN(when.getTime()) || when.getTime() < Date.now()) {
        return res.status(400).json({ message: 'Viewing date/time must be in the future' });
      }
      const conflict = await findConflict({
        propertyId: viewing.property,
        agentId: viewing.agent,
        dateTime: when,
        excludeId: viewing._id
      });
      if (conflict) {
        return res.status(409).json({ message: 'That hour is already booked for this property or agent' });
      }
      viewing.dateTime = when;
      if (viewing.status !== 'Cancelled') viewing.status = 'Rescheduled';
    }

    if (notes !== undefined) viewing.notes = notes;

    await viewing.save();
    res.json({ message: 'Viewing updated successfully', viewing });
  } catch (error) {
    console.error('Update viewing error:', error);
    res.status(500).json({ message: 'Failed to update viewing' });
  }
};

module.exports = {
  createViewing,
  getMyViewings,
  getAgentViewings,
  getAdminViewings,
  updateViewing
};
