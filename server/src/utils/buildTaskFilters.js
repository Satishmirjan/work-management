const dayjs = require('dayjs');

const buildTaskFilters = (query = {}) => {
  const { project, person, fromDate, toDate } = query;
  const filters = {};

  if (project && project !== 'all') {
    filters.project = project;
  }

  if (person && person !== 'all') {
    filters.person = person;
  }

  if (fromDate || toDate) {
    filters.workDate = {};
    if (fromDate) {
      filters.workDate.$gte = dayjs(fromDate, 'YYYY-MM-DD').startOf('day').toDate();
    }
    if (toDate) {
      filters.workDate.$lte = dayjs(toDate, 'YYYY-MM-DD').endOf('day').toDate();
    }
  }

  return filters;
};

module.exports = buildTaskFilters;

