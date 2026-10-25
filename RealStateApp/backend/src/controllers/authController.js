const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'dha_estate_pro_super_secret_jwt_key_2026',
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET || 'dha_estate_pro_super_secret_refresh_jwt_key_2026',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    // Security: public registration can never self-assign a role.
    // New accounts are always created as USER; only an ADMIN can
    // promote a user via PUT /api/auth/users/:id/role.
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'USER',
      phone,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedProperties: user.savedProperties
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'dha_estate_pro_super_secret_refresh_jwt_key_2026',
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const tokens = generateTokens(user);
        res.json({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        });
      }
    );
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve profile context' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedProperties: user.savedProperties
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};

const toggleSaveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedIndex = user.savedProperties.indexOf(propertyId);
    let saved = false;

    if (savedIndex > -1) {
      user.savedProperties.splice(savedIndex, 1);
    } else {
      user.savedProperties.push(propertyId);
      saved = true;
    }

    await user.save();

    res.json({
      message: saved ? 'Property saved to favorites' : 'Property removed from favorites',
      savedProperties: user.savedProperties
    });
  } catch (error) {
    console.error('Toggle save property error:', error);
    res.status(500).json({ message: 'Failed to toggle favorite status' });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'AGENT' }).select('-passwordHash');
    res.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Failed to retrieve agents list' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve user directory' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.email === 'admin@dhaestatepro.com') {
      return res.status(400).json({ message: 'Default system Administrator cannot be deleted' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User account removed successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'OWNER', 'AGENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role assignment' });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToUpdate.email === 'admin@dhaestatepro.com') {
      return res.status(400).json({ message: 'Cannot modify role of the default system Administrator' });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.json({
      message: `User role updated successfully to ${role}`,
      user: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  getMe,
  updateProfile,
  toggleSaveProperty,
  getAgents,
  getAllUsers,
  deleteUser,
  updateUserRole
};
