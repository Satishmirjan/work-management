const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI||'mongodb+srv://satishnda3576_db_user:AT2Zu5rRa5og2T9j@cluster0.y33klgw.mongodb.net/?appName=Cluster0';

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Mongo connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

