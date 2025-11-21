const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set; using fallback secret. Configure .env in production.');
}

const buildTokenPayload = (user) => ({
  id: user._id.toString(),
  username: user.username,
  role: user.role,
  displayName: user.displayName,
});

const login = async (req, res) => {
  const { username, email, identifier, password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const lookupValue = (identifier || username || email || '').toLowerCase().trim();

  if (!lookupValue) {
    res.status(400);
    throw new Error('Username or email is required');
  }

  const user = await User.findOne({
    $or: [{ username: lookupValue }, { email: lookupValue }],
  });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(buildTokenPayload(user), JWT_SECRET, {
    expiresIn: '12h',
  });

  res.json({
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
};

module.exports = {
  login,
};


