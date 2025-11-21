const bcrypt = require('bcryptjs');
const User = require('../models/User');

const collectSeedUsers = () => {
  const seeds = [];
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    seeds.push({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      displayName: process.env.ADMIN_DISPLAY_NAME || 'Administrator',
      role: 'admin',
    });
  }

  if (process.env.DEFAULT_USER_USERNAME && process.env.DEFAULT_USER_PASSWORD) {
    seeds.push({
      username: process.env.DEFAULT_USER_USERNAME,
      password: process.env.DEFAULT_USER_PASSWORD,
      displayName: process.env.DEFAULT_USER_DISPLAY_NAME || 'Team Member',
      role: 'user',
    });
  }

  // If no env-configured users, fall back to baked-in demo accounts.
  if (!seeds.length) {
    console.warn('No env-configured users detected; seeding fallback demo accounts.');
    seeds.push(
      {
        username: 'admin',
        password: 'admin123',
        displayName: 'Administrator',
        role: 'admin',
      },
      {
        username: 'satish',
        password: 'satish',
        displayName: 'Satish',
        role: 'user',
      },
      {
        username: 'prajwal',
        password: 'prajwal',
        displayName: 'Prajwal',
        role: 'user',
      },
    );
  }

  return seeds;
};

const ensureDefaultUsers = async () => {
  const seeds = collectSeedUsers();
  for (const seed of seeds) {
    const username = seed.username.toLowerCase().trim();
    const existing = await User.findOne({ username });
    if (existing) {
      continue;
    }

    const passwordHash = await bcrypt.hash(seed.password, 10);
    await User.create({
      username,
      displayName: seed.displayName || username,
      passwordHash,
      role: seed.role,
    });
    console.log(`Created default ${seed.role} user: ${username}`);
  }
};

module.exports = ensureDefaultUsers;


