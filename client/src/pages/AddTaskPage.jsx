import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  createTask,
  fetchTask,
  fetchTaskOptions,
  updateTask,
} from '../services/taskService';
import {
  defaultActivities,
  defaultMilestones,
  defaultPeople,
  defaultProjects,
} from '../constants/options';

const today = dayjs().format('YYYY-MM-DD');
const initialForm = {
  name: '',
  workDate: today,
  person: '',
  project: '',
  milestone: 'None',
  genericActivity: '',
  plannedStart: '',
  plannedEnd: '',
  actualStart: '',
  actualEnd: '',
};

const buildOptions = (fallback = [], fetched = []) => {
  const merged = [...new Set([...fallback, ...(fetched ?? [])])].filter(Boolean);
  return merged.length ? merged : fallback;
};

function AddTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(taskId);

  const [form, setForm] = useState(initialForm);
  const [options, setOptions] = useState({
    projects: defaultProjects,
    people: defaultPeople,
    milestones: defaultMilestones,
    genericActivities: defaultActivities,
  });
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

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
      } catch (error) {
        console.error('Failed to load options', error);
        setAlert({ type: 'error', message: 'Unable to load dropdown options.' });
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setTaskLoading(false);
      setForm(initialForm);
      return;
    }

    const loadTask = async () => {
      try {
        const data = await fetchTask(taskId);
        setForm({
          name: data.name ?? '',
          workDate: data.workDate ? dayjs(data.workDate).format('YYYY-MM-DD') : today,
          person: data.person ?? '',
          project: data.project ?? '',
          milestone: data.milestone ?? 'None',
          genericActivity: data.genericActivity ?? '',
          plannedStart: data.plannedStart ? dayjs(data.plannedStart).format('YYYY-MM-DD') : '',
          plannedEnd: data.plannedEnd ? dayjs(data.plannedEnd).format('YYYY-MM-DD') : '',
          actualStart: data.actualStart ? dayjs(data.actualStart).format('YYYY-MM-DD') : '',
          actualEnd: data.actualEnd ? dayjs(data.actualEnd).format('YYYY-MM-DD') : '',
        });
      } catch (error) {
        console.error('Failed to fetch task', error);
        setAlert({ type: 'error', message: 'We could not load the task for editing.' });
      } finally {
        setTaskLoading(false);
      }
    };

    loadTask();
  }, [isEditing, taskId]);

  const isFormDisabled = useMemo(() => loading || taskLoading || saving, [loading, taskLoading, saving]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAlert(null);
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      workDate: form.workDate,
      person: form.person.trim(),
      project: form.project.trim(),
      milestone: form.milestone || 'None',
      genericActivity: form.genericActivity.trim(),
      plannedStart: form.plannedStart || null,
      plannedEnd: form.plannedEnd || null,
      actualStart: form.actualStart || null,
      actualEnd: form.actualEnd || null,
    };

    try {
      if (isEditing) {
        await updateTask(taskId, payload);
      } else {
        await createTask(payload);
      }

      setAlert({ type: 'success', message: `Task ${isEditing ? 'updated' : 'saved'} successfully.` });
      navigate('/tasks');
    } catch (error) {
      console.error('Saving task failed', error);
      setAlert({ type: 'error', message: error?.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-card">
      <h1 className="page-title">Add Task / Activity</h1>
      <p className="page-subtitle">
        Capture the work you or your team completed today, along with the planned and actual dates.
      </p>

      {alert && (
        <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>{alert.message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <h2>Basic Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Task Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter task name"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workDate">Today&apos;s Date</label>
            <input
              id="workDate"
              name="workDate"
              type="date"
              value={form.workDate}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="person">Person</label>
            <input
              id="person"
              name="person"
              type="text"
              list="people-options"
              value={form.person}
              onChange={handleChange}
              placeholder="Who is responsible?"
              required
              disabled={isFormDisabled}
            />
            <datalist id="people-options">
              {options.people.map((person) => (
                <option key={person} value={person} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select id="project" name="project" value={form.project} onChange={handleChange} required disabled={isFormDisabled}>
              <option value="" disabled>
                Select a project
              </option>
              {options.projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="milestone">Milestone</label>
            <select id="milestone" name="milestone" value={form.milestone} onChange={handleChange} disabled={isFormDisabled}>
              <option value="None">None</option>
              {options.milestones
                .filter((milestone) => milestone !== 'None')
                .map((milestone) => (
                  <option key={milestone} value={milestone}>
                    {milestone}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="genericActivity">Generic Activity</label>
            <select
              id="genericActivity"
              name="genericActivity"
              value={form.genericActivity}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
            >
              <option value="" disabled>
                Select activity type
              </option>
              {options.genericActivities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="divider" />

        <h2>Dates</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="plannedStart">Planned Start Date</label>
            <input
              id="plannedStart"
              name="plannedStart"
              type="date"
              value={form.plannedStart}
              onChange={handleChange}
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="plannedEnd">Planned End Date</label>
            <input
              id="plannedEnd"
              name="plannedEnd"
              type="date"
              value={form.plannedEnd}
              onChange={handleChange}
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="actualStart">Actual Start Date</label>
            <input
              id="actualStart"
              name="actualStart"
              type="date"
              value={form.actualStart}
              onChange={handleChange}
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label htmlFor="actualEnd">Actual End Date</label>
            <input
              id="actualEnd"
              name="actualEnd"
              type="date"
              value={form.actualEnd}
              onChange={handleChange}
              disabled={isFormDisabled}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={isFormDisabled}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isFormDisabled}>
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Task'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddTaskPage;


