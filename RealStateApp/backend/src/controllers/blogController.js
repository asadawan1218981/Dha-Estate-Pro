const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
  try {
    const { isFeatured, category } = req.query;
    const filter = {};

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (category) {
      filter.category = category;
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Failed to retrieve blogs' });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Get blog detail error:', error);
    res.status(500).json({ message: 'Failed to retrieve blog details' });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, coverImage, isFeatured } = req.body;

    if (!title || !content || !category || !coverImage) {
      return res.status(400).json({ message: 'Key blog fields are required' });
    }

    // Generate basic url slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(409).json({ message: 'A blog with a matching or highly similar title already exists' });
    }

    const blog = await Blog.create({
      title,
      content,
      slug,
      category,
      tags: tags || [],
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      coverImage,
      isFeatured: isFeatured || false
    });

    res.status(201).json({
      message: 'Blog article created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Failed to create blog article' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    const updates = req.body;
    const fieldsToUpdate = ['title', 'content', 'category', 'tags', 'coverImage', 'isFeatured'];

    fieldsToUpdate.forEach((field) => {
      if (updates[field] !== undefined) {
        blog[field] = updates[field];
      }
    });

    // Re-generate slug if title is updated
    if (updates.title) {
      blog.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    await blog.save();

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Failed to update blog article' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    await Blog.findByIdAndDelete(id);
    res.json({ message: 'Blog article deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Failed to delete blog article' });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};
