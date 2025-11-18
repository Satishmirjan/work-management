import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  fetchTaskOptions,
  fetchTasks,
  removeTask,
} from '../services/taskService';
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

const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—');

function TaskListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [tasks, setTasks] = useState([]);
  const [options, setOptions] = useState({
    projects: defaultProjects,
    people: defaultPeople,
    milestones: defaultMilestones,
    genericActivities: defaultActivities,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(appliedFilters);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      setError('Unable to load tasks right now.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) {
      return;
    }
    setDeletingId(taskId);
    try {
      await removeTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
      setError('Delete failed, please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const tableContent = useMemo(() => {
    if (loading) {
      return <div className="empty-state">Loading tasks...</div>;
    }

    if (error) {
      return <div className="empty-state">{error}</div>;
    }

    if (!tasks.length) {
      return <div className="empty-state">No tasks captured yet. Start by adding your first task.</div>;
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="task-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Person</th>
              <th>Project</th>
              <th>Milestone</th>
              <th>Generic Activity</th>
              <th>Today&apos;s Date</th>
              <th>Planned Start</th>
              <th>Planned End</th>
              <th>Actual Start</th>
              <th>Actual End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.name}</td>
                <td>{task.person}</td>
                <td>{task.project}</td>
                <td>{task.milestone || 'None'}</td>
                <td>{task.genericActivity}</td>
                <td>{formatDate(task.workDate)}</td>
                <td>{formatDate(task.plannedStart)}</td>
                <td>{formatDate(task.plannedEnd)}</td>
                <td>{formatDate(task.actualStart)}</td>
                <td>{formatDate(task.actualEnd)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="icon-button edit"
                      onClick={() => navigate(`/tasks/${task._id}/edit`)}
                      title="Edit"
                    >
                      ✏
                    </button>
                    <button
                      type="button"
                      className="icon-button delete"
                      onClick={() => handleDelete(task._id)}
                      title="Delete"
                      disabled={deletingId === task._id}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [loading, error, tasks, deletingId, navigate]);

  return (
    <section>
      <div className="filters-bar">
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="project-filter">Project</label>
            <select
              id="project-filter"
              name="project"
              value={filters.project}
              onChange={handleFilterChange}
            >
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
            <input id="fromDate" type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
          </div>

          <div className="form-group">
            <label htmlFor="toDate">To Date</label>
            <input id="toDate" type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>
            Filter
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2 style={{ margin: 0 }}>Task List</h2>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
              Every task you add appears here. Filter, edit, or delete as needed.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/tasks/new')}>
            + Add New Task
          </button>
        </div>

        {tableContent}
      </div>
    </section>
  );
}

export default TaskListPage;


