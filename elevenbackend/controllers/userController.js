const User = require('../models/User');
const { getAuth } = require('firebase-admin/auth');
const auth = getAuth();

// Get user profile by uid
exports.getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const user = await User.findByUid(req.db, uid);
    if (!user || !user.uid || user.uid === '') {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return filtered user info
    const { displayName, email, photoURL, role, isFraud } = user;
    res.json({
      user: {
        displayName,
        email,
        photoURL,
        role,
        isFraud
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile (e.g., displayName, photoURL)
exports.updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { displayName, photoURL } = req.body;

    // Update in Firebase Auth
    await auth.updateUser(uid, {
      displayName,
      photoURL,
    });

    // Update in MongoDB
    const updateData = {};
    if (displayName !== undefined && displayName !== null && displayName !== '') {
      updateData.displayName = displayName;
    }
    if (photoURL !== undefined && photoURL !== null && photoURL !== '') {
      updateData.photoURL = photoURL;
    }

    await User.updateUser(req.db, uid, updateData);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers(req.db);
    if (!users || !Array.isArray(users)) {
      return res.status(500).json({ error: 'Server error retrieving users' });
    }

    // Return filtered user info
    const filteredUsers = users.map(user => ({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
      isFraud: user.isFraud
    }));

    res.json({ users: filteredUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error retrieving users' });
  }
};

// Make user admin (Admin only)
exports.makeAdmin = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findByUid(req.db, uid);
    if (!user || !user.uid) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.updateUser(req.db, uid, { role: 'admin' });

    res.json({ message: 'User promoted to admin', user: { role: 'admin' } });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Make user agent (Admin only)
exports.makeAgent = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findByUid(req.db, uid);
    if (!user || !user.uid) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.updateUser(req.db, uid, { role: 'agent' });

    res.json({ message: 'User promoted to agent', user: { role: 'agent' } });
  } catch (error) {
    console.error('Make agent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark agent as fraud (Admin only)
exports.markFraudAgent = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findByUid(req.db, uid);
    if (!user || !user.uid) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'agent') {
      return res.status(400).json({ error: 'User is not an agent' });
    }

    await User.updateUser(req.db, uid, { isFraud: true, role: 'fraud' });

    res.json({ message: 'Agent marked as fraud', user: { isFraud: true, role: 'fraud' } });
  } catch (error) {
    console.error('Mark as fraud error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const success = await User.deleteUserByUid(req.db, uid);
    
    if (!success || success === 0 || success < 1){
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete from Firebase
    await auth.deleteUser(uid);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};