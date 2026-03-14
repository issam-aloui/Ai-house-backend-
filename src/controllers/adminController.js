const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (admin) => {
  return jwt.sign(
    { 
      id: admin.id, 
      username: admin.username, 
      role: admin.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await Admin.verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await Admin.updateLastLogin(admin.id);

    // Generate token
    const token = generateToken(admin);

    // Remove password from response
    const { password_hash, ...adminData } = admin;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminData,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Get all admins (super admin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

// Create new admin (super admin only)
exports.createAdmin = async (req, res) => {
  try {
    // Check if username or email already exists
    const existingUsername = await Admin.findByUsername(req.body.username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const existingEmail = await Admin.findByEmail(req.body.email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const admin = await Admin.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
};

// Update admin (super admin only)
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-demotion
    if (parseInt(id) === req.admin.id && req.body.role && req.body.role !== req.admin.role) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const admin = await Admin.update(id, req.body);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
};

// Delete admin (super admin only)
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.admin.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const admin = await Admin.delete(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
};

// Change password (current admin)
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get admin with password
    const admin = await Admin.findByUsername(req.admin.username);
    
    // Verify current password
    const isPasswordValid = await Admin.verifyPassword(current_password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await Admin.update(req.admin.id, { password: new_password });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};
