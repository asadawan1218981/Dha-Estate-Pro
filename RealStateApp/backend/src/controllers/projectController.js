const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const { isFeatured, phase } = req.query;
    const filter = {};

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (phase) {
      filter.phase = phase;
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to retrieve projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project detail error:', error);
    res.status(500).json({ message: 'Failed to retrieve project details' });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, location, phase, images, status, priceStarting, areaRange, isFeatured } = req.body;

    if (!title || !description || !location || !phase || !status || !priceStarting || !areaRange) {
      return res.status(400).json({ message: 'All core project fields are required' });
    }

    const project = await Project.create({
      title,
      description,
      location,
      phase,
      images: images && images.length ? images : ['/images/1545324418-cc1a3fa10c00.jpg'],
      status,
      priceStarting,
      areaRange,
      isFeatured: isFeatured || false
    });

    res.status(201).json({
      message: 'Luxury project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project listing' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = req.body;
    const fieldsToUpdate = ['title', 'description', 'location', 'phase', 'images', 'status', 'priceStarting', 'areaRange', 'isFeatured'];

    fieldsToUpdate.forEach((field) => {
      if (updates[field] !== undefined) {
        project[field] = updates[field];
      }
    });

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project listing' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
