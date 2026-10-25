const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Project = require('../models/Project');
const User = require('../models/User');

const submitLead = async (req, res) => {
  try {
    const { propertyId, projectId, name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All contact details and message are required' });
    }

    if (!propertyId && !projectId) {
      return res.status(400).json({ message: 'Property ID or Project ID is required' });
    }

    let agentId;
    
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Target property not found' });
      }
      agentId = property.agent;

      const lead = await Lead.create({
        propertyId,
        userId: req.user ? req.user._id : undefined,
        name,
        email,
        phone,
        message,
        agentId
      });

      // Atomically increment lead counter on the property record
      await Property.findByIdAndUpdate(propertyId, { $inc: { leadsCount: 1 } });

      return res.status(201).json({
        message: 'Inquiry submitted successfully. An agent will contact you shortly.',
        lead
      });
    } else {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Target project not found' });
      }

      // Assign project lead to the first Admin user
      const adminUser = await User.findOne({ role: 'ADMIN' });
      agentId = adminUser ? adminUser._id : undefined;

      const lead = await Lead.create({
        projectId,
        userId: req.user ? req.user._id : undefined,
        name,
        email,
        phone,
        message,
        agentId
      });

      return res.status(201).json({
        message: 'Project interest registered successfully. Our team will contact you shortly.',
        lead
      });
    }
  } catch (error) {
    console.error('Submit lead error:', error);
    res.status(500).json({ message: 'Inquiry submission failed' });
  }
};

const getAgentLeads = async (req, res) => {
  try {
    const agentId = req.user._id;

    const leads = await Lead.find({ agentId })
      .populate('propertyId', 'title price area location images')
      .populate('projectId', 'title priceStarting location images')
      .sort({ createdAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Get agent leads error:', error);
    res.status(500).json({ message: 'Failed to retrieve agent leads' });
  }
};

const getAdminLeads = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('propertyId', 'title price location')
      .populate('projectId', 'title priceStarting location')
      .populate('agentId', 'name email role phone')
      .sort({ createdAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Get admin leads error:', error);
    res.status(500).json({ message: 'Failed to retrieve overall inquiry logs' });
  }
};

const getUserLeads = async (req, res) => {
  try {
    const userId = req.user._id;

    const leads = await Lead.find({ userId })
      .populate('propertyId', 'title price area location images')
      .populate('projectId', 'title priceStarting location images')
      .sort({ createdAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Get user leads error:', error);
    res.status(500).json({ message: 'Failed to retrieve inquiry history' });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Pending' | 'Contacted' | 'Closed'

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Inquiry record not found' });
    }

    // Role check: agent must own it, or role must be admin
    if (lead.agentId && lead.agentId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    lead.status = status;
    await lead.save();

    res.json({
      message: 'Inquiry status updated successfully',
      lead
    });
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

module.exports = {
  submitLead,
  getAgentLeads,
  getAdminLeads,
  getUserLeads,
  updateLeadStatus
};
