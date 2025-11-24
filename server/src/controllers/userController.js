const bcrypt = require('bcryptjs');
const User = require('../models/User');

const listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash');
  res.json(users);
};

const createUser = async (req, res) => {
  const { username, email, password, displayName, role = 'user' } = req.body;

  if (!username || !password || !displayName) {
    res.status(400);
    throw new Error('Username, display name, and password are required');
  }

  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email?.toLowerCase().trim();

  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    res.status(409);
    throw new Error('Username already exists');
  }

  if (normalizedEmail) {
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      res.status(409);
      throw new Error('Email already exists');
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    displayName: displayName.trim(),
    passwordHash,
    role,
  });

  res.status(201).json({
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    displayName: newUser.displayName,
    role: newUser.role,
  });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  res.json({ message: 'Password changed successfully' });
};

module.exports = {
  listUsers,
  createUser,
  changePassword,
};



