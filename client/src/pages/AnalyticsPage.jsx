import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { fetchTaskOptions, fetchTaskStats } from '../services/taskService';
import {
  defaultActivities,
  defaultMilestones,
  defaultPeople,
  defaultProjects,
} from '../constants/options';

const defaultFilters = {
  project: 'all',
  person: 'all',
  fromDate: '',
  toDate: '',
};

const buildOptions = (fallback = [], fetched = []) => {
  const merged = [...new Set([...fallback, ...(fetched ?? [])])].filter(Boolean);
  return merged.length ? merged : fallback;
};

const tooltipFormatter = (value) => [value, 'Tasks'];

const PIE_COLORS = ['#6366f1', '#f97316', '#22c55e', '#eab308', '#06b6d4', '#ef4444'];

function AnalyticsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [stats, setStats] = useState({
    summary: { total: 0, completed: 0, open: 0 },
    tasksByProject: [],
    tasksByPerson: [],
  });

  const [options, setOptions] = useState({
    projects: defaultProjects,
    people: defaultPeople,
    milestones: defaultMilestones,
    genericActivities: defaultActivities,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pieType, setPieType] = useState('project'); // project/person toggle

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchTaskOptions();
        setOptions({
          projects: buildOptions(defaultProjects, data.projects),
          people: buildOptions(defaultPeople, data.people),
          milestones: buildOptions(defaultMilestones, data.milestones),
          genericActivities: buildOptions(defaultActivities, data.genericActivities),
        });
      } catch (err) {
        console.error('Failed to load options', err);
      }
    };

    loadOptions();
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaskStats(appliedFilters);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
      setError('Unable to load analytics right now.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const pieData = pieType === 'project' ? stats.tasksByProject : stats.tasksByPerson;

  const detailedRows =
    stats.tasksByProject.length ? stats.tasksByProject : stats.tasksByPerson;

  const detailedLabel = stats.tasksByProject.length ? 'Project' : 'Person';

  return (
    <section className="fade-in" style={{ padding: '1rem' }}>

      {/* Header */}
      <div className="page-card shadow-lg" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">📊 Analytics Dashboard</h1>
        <p className="page-subtitle">
          View task performance insights across projects and team members.
        </p>

        {/* Filters */}
        <div className="filters-bar glass-card">
          <div className="filters-grid">

            <div className="form-group">
              <label>Project</label>
              <select name="project" value={filters.project} onChange={handleFilterChange}>
                <option value="all">All Projects</option>
                {options.projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Person</label>
              <select name="person" value={filters.person} onChange={handleFilterChange}>
                <option value="all">All People</option>
                {options.people.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>From</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
            </div>

            <div className="form-group">
              <label>To</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-primary" onClick={handleApplyFilters}>Apply</button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>Clear</button>
          </div>
        </div>
      </div>

      {/* Data */}
      {loading ? (
        <div className="empty-state">Loading analytics...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card pop">
              <h4>Total Tasks</h4>
              <p className="stat-value">{stats.summary.total}</p>
            </div>

            <div className="stat-card pop">
              <h4>Completed</h4>
              <p className="stat-value">{stats.summary.completed}</p>
            </div>

            <div className="stat-card pop">
              <h4>Open</h4>
              <p className="stat-value">{stats.summary.open}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="chart-card glass-card">
            <div className="flex-between">
              <h3>Distribution</h3>

              <select
                value={pieType}
                onChange={(e) => setPieType(e.target.value)}
                className="pie-select"
              >
                <option value="project">By Project</option>
                <option value="person">By Person</option>
              </select>
            </div>

            {pieData.length ? (
              <ResponsiveContainer width="100%" height={330}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="total"
                  nameKey="key"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={800}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    `${props.payload.key} (${((value / stats.summary.total) * 100).toFixed(
                      1
                    )}%)`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            ) : (
              <div className="empty-state">No data yet</div>
            )}
          </div>

          {/* Bar Charts */}
          <div className="chart-grid">
            <div className="chart-card glass-card">
              <h3>Tasks by Project</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.tasksByProject}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="key" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card glass-card">
              <h3>Tasks by Person</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.tasksByPerson}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="key" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="table-card glass-card">
            <h3>Detailed Analytics</h3>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>{detailedLabel}</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {detailedRows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.key}</td>
                    <td>{row.total}</td>
                    <td>{row.completed}</td>
                    <td>{row.open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default AnalyticsPage;
