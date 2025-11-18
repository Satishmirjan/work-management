const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const taskRoutes = require('./routes/taskRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/lookups', lookupRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

