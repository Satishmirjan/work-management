const LookupValue = require('../models/LookupValue');

const allowedTypes = ['project', 'person', 'milestone', 'activity'];

const groupByType = (records = []) =>
  allowedTypes.reduce((acc, type) => {
    acc[type] = records.filter((item) => item.type === type).map((item) => ({
      id: item._id,
      value: item.value,
    }));
    return acc;
  }, {});

const getLookupValues = async (req, res) => {
  const records = await LookupValue.find().sort({ value: 1 });
  res.json(groupByType(records));
};

const createLookupValue = async (req, res) => {
  const { type, value } = req.body;

  if (!allowedTypes.includes(type)) {
    res.status(400);
    throw new Error('Invalid lookup type');
  }

  if (!value || !value.trim()) {
    res.status(400);
    throw new Error('Lookup value is required');
  }

  const trimmedValue = value.trim();

  const existing = await LookupValue.findOne({ type, value: trimmedValue });
  if (existing) {
    res.status(409);
    throw new Error('Value already exists');
  }

  const record = await LookupValue.create({ type, value: trimmedValue });
  res.status(201).json({ id: record._id, value: record.value, type: record.type });
};

const deleteLookupValue = async (req, res) => {
  const record = await LookupValue.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Lookup value not found');
  }

  await record.deleteOne();
  res.json({ message: 'Lookup value removed' });
};

module.exports = {
  getLookupValues,
  createLookupValue,
  deleteLookupValue,
};


