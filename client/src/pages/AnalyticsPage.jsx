import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

  const detailedRows = stats.tasksByProject.length ? stats.tasksByProject : stats.tasksByPerson;
  const detailedLabel = stats.tasksByProject.length ? 'Project' : 'Person';

  return (
    <section>
      <div className="page-card" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
          Analytics
        </h1>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
          Track productivity trends across projects, people, and activities.
        </p>

        <div className="filters-bar">
          <div className="filters-grid">
            <div className="form-group">
              <label htmlFor="project-filter">Project</label>
              <select id="project-filter" name="project" value={filters.project} onChange={handleFilterChange}>
                <option value="all">All Projects</option>
                {options.projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="person-filter">Person</label>
              <select id="person-filter" name="person" value={filters.person} onChange={handleFilterChange}>
                <option value="all">All People</option>
                {options.people.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fromDate">From Date</label>
              <input id="fromDate" name="fromDate" type="date" value={filters.fromDate} onChange={handleFilterChange} />
            </div>

            <div className="form-group">
              <label htmlFor="toDate">To Date</label>
              <input id="toDate" name="toDate" type="date" value={filters.toDate} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>
              Apply
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading analytics...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{stats.summary.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                Tasks per {filters.project === 'all' ? 'Project' : filters.project}
              </div>
              <div className="stat-value">
                {filters.project === 'all'
                  ? stats.tasksByProject.reduce((sum, row) => sum + row.total, 0)
                  : stats.tasksByProject.find((row) => row.key === filters.project)?.total ?? 0}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Completed Tasks</div>
              <div className="stat-value">{stats.summary.completed}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Open Tasks</div>
              <div className="stat-value">{stats.summary.open}</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>Tasks by Project</h3>
              {stats.tasksByProject.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.tasksByProject}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={tooltipFormatter} />
                    <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">No project data yet.</div>
              )}
            </div>

            <div className="chart-card">
              <h3>Tasks by Person</h3>
              {stats.tasksByPerson.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.tasksByPerson}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={tooltipFormatter} />
                    <Bar dataKey="total" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">No person data yet.</div>
              )}
            </div>
          </div>

          <div className="table-card">
            <div className="table-card-header">
              <h2 style={{ margin: 0 }}>Detailed Analytics</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
                Breakdown of totals by {detailedLabel.toLowerCase()}.
              </p>
            </div>

            {detailedRows.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>{detailedLabel}</th>
                      <th>Total Tasks</th>
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
            ) : (
              <div className="empty-state">Add more tasks to see detailed analytics.</div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default AnalyticsPage;


