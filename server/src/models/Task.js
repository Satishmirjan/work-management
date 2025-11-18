const { Schema, model } = require('mongoose');

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workDate: {
      type: Date,
      required: true,
    },
    person: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    milestone: {
      type: String,
      default: 'None',
      trim: true,
    },
    genericActivity: {
      type: String,
      required: true,
      trim: true,
    },
    plannedStart: Date,
    plannedEnd: Date,
    actualStart: Date,
    actualEnd: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = model('Task', taskSchema);

