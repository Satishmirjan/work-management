require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const ensureDefaultUsers = require('./config/seedDefaultUsers');

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await ensureDefaultUsers();

  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

start();

