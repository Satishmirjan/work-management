const { Schema, model } = require('mongoose');

const lookupSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['project', 'person', 'milestone', 'activity'],
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

lookupSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = model('LookupValue', lookupSchema);


