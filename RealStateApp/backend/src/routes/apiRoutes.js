const express = require('express');
const router = express.Router();

const { authenticateToken, checkRole, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const authController = require('../controllers/authController');
const propertyController = require('../controllers/propertyController');
const leadController = require('../controllers/leadController');
const blogController = require('../controllers/blogController');
const projectController = require('../controllers/projectController');
const viewingController = require('../controllers/viewingController');
const paymentController = require('../controllers/paymentController');
const { uploadImage } = require('../controllers/uploadController');

// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/refresh', authController.refresh);
router.get('/auth/me', authenticateToken, authController.getMe);
router.put('/auth/profile', authenticateToken, authController.updateProfile);
router.post('/auth/favorites/:propertyId', authenticateToken, authController.toggleSaveProperty);
router.get('/auth/agents', authController.getAgents);
router.get('/auth/users', authenticateToken, checkRole(['ADMIN']), authController.getAllUsers);
router.delete('/auth/users/:id', authenticateToken, checkRole(['ADMIN']), authController.deleteUser);
router.put('/auth/users/:id/role', authenticateToken, checkRole(['ADMIN']), authController.updateUserRole);

// ==========================================
// Property Listings Routes
// ==========================================
// Public reads use optionalAuth so verification visibility can be
// enforced: public sees Approved listings only; scope=mine returns the
// caller's own listings; scope=all is admin-only.
router.get('/properties', optionalAuth, propertyController.getProperties);
router.get('/properties/analytics', authenticateToken, checkRole(['OWNER', 'AGENT']), propertyController.getAgentAnalytics);
router.get('/properties/admin-analytics', authenticateToken, checkRole(['ADMIN']), propertyController.getAdminAnalytics);
router.get('/properties/:id', optionalAuth, propertyController.getPropertyById);
router.post('/properties', authenticateToken, checkRole(['OWNER', 'AGENT', 'ADMIN']), propertyController.createProperty);
router.put('/properties/:id/verify', authenticateToken, checkRole(['ADMIN']), propertyController.verifyProperty);
router.put('/properties/:id', authenticateToken, checkRole(['OWNER', 'AGENT', 'ADMIN']), propertyController.updateProperty);
router.delete('/properties/:id', authenticateToken, checkRole(['OWNER', 'AGENT', 'ADMIN']), propertyController.deleteProperty);

// ==========================================
// Lead & Inquiry Routes
// (Lead is the inquiry record: Pending -> Contacted -> Closed)
// ==========================================
router.post('/leads', leadController.submitLead);
router.get('/leads/me', authenticateToken, leadController.getUserLeads);
router.get('/leads/agent', authenticateToken, checkRole(['AGENT']), leadController.getAgentLeads);
router.get('/leads/admin', authenticateToken, checkRole(['ADMIN']), leadController.getAdminLeads);
router.put('/leads/:id', authenticateToken, checkRole(['AGENT', 'ADMIN']), leadController.updateLeadStatus);

// ==========================================
// Viewing / Appointment Routes
// ==========================================
router.post('/viewings', authenticateToken, viewingController.createViewing);
router.get('/viewings/me', authenticateToken, viewingController.getMyViewings);
router.get('/viewings/agent', authenticateToken, checkRole(['AGENT']), viewingController.getAgentViewings);
router.get('/viewings/admin', authenticateToken, checkRole(['ADMIN']), viewingController.getAdminViewings);
router.put('/viewings/:id', authenticateToken, viewingController.updateViewing);

// ==========================================
// Payment Routes (SANDBOX ONLY - no real gateway integrated)
// ==========================================
router.post('/payments', authenticateToken, paymentController.createPayment);
router.get('/payments/me', authenticateToken, paymentController.getMyPayments);
router.get('/payments/admin', authenticateToken, checkRole(['ADMIN']), paymentController.getAdminPayments);
router.put('/payments/:id/confirm', authenticateToken, paymentController.confirmSandboxPayment);
router.put('/payments/:id/status', authenticateToken, paymentController.updatePaymentStatus);

// ==========================================
// Local Image Upload (max 100 KB, enforced server-side)
// ==========================================
router.post('/uploads/image', authenticateToken, checkRole(['OWNER', 'AGENT', 'ADMIN']), uploadImage);

// ==========================================
// Blogs System Routes
// ==========================================
router.get('/blogs', blogController.getBlogs);
router.get('/blogs/:slug', blogController.getBlogBySlug);
router.post('/blogs', authenticateToken, checkRole(['ADMIN']), blogController.createBlog);
router.put('/blogs/:id', authenticateToken, checkRole(['ADMIN']), blogController.updateBlog);
router.delete('/blogs/:id', authenticateToken, checkRole(['ADMIN']), blogController.deleteBlog);

// ==========================================
// Projects System Routes
// ==========================================
router.get('/projects', projectController.getProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', authenticateToken, checkRole(['ADMIN']), projectController.createProject);
router.put('/projects/:id', authenticateToken, checkRole(['ADMIN']), projectController.updateProject);
router.delete('/projects/:id', authenticateToken, checkRole(['ADMIN']), projectController.deleteProject);

module.exports = router;
