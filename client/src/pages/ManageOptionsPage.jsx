import { useEffect, useState } from 'react';
import { createLookupValue, fetchLookups } from '../services/lookupService';

const lookupConfigs = [
  {
    type: 'project',
    title: 'Projects',
    description: 'List every project your team is tracking.',
    placeholder: 'Project name',
    buttonLabel: 'Save Project',
  },
  {
    type: 'person',
    title: 'People',
    description: 'Add teammates responsible for tasks.',
    placeholder: 'Person name',
    buttonLabel: 'Save Person',
  },
  {
    type: 'milestone',
    title: 'Milestones',
    description: 'Optional checkpoints tied to a project.',
    placeholder: 'Milestone name',
    buttonLabel: 'Save Milestone',
  },
  {
    type: 'activity',
    title: 'Generic Activities',
    description: 'Reuse activity types such as Coding or Testing.',
    placeholder: 'Activity name',
    buttonLabel: 'Save Activity',
  },
];

const defaultLookupState = {
  project: [],
  person: [],
  milestone: [],
  activity: [],
};

const defaultInputState = {
  project: '',
  person: '',
  milestone: '',
  activity: '',
};

function ManageOptionsPage() {
  const [lookups, setLookups] = useState(defaultLookupState);
  const [inputs, setInputs] = useState(defaultInputState);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [savingType, setSavingType] = useState(null);

  const loadLookups = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const data = await fetchLookups();
      setLookups({ ...defaultLookupState, ...data });
    } catch (error) {
      console.error('Failed to load lookup values', error);
      setAlert({ type: 'error', message: 'Unable to load current options.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  const handleChange = (type, value) => {
    setInputs((prev) => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async (type) => {
    if (!inputs[type].trim()) {
      setAlert({ type: 'error', message: 'Please provide a value before saving.' });
      return;
    }

    setSavingType(type);
    setAlert(null);
    try {
      await createLookupValue({ type, value: inputs[type] });
      setInputs((prev) => ({ ...prev, [type]: '' }));
      await loadLookups();
      setAlert({ type: 'success', message: 'Saved successfully.' });
    } catch (error) {
      console.error('Failed to save lookup', error);
      const message = error?.response?.data?.message || 'Could not save value.';
      setAlert({ type: 'error', message });
    } finally {
      setSavingType(null);
    }
  };

  return (
    <section>
      <div className="page-card" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
          Manage Options
        </h1>
        <p className="page-subtitle">Control the master list of projects, people, milestones, and generic activities.</p>
        {alert && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
            {alert.message}
          </div>
        )}
      </div>

      {loading ? (
        <div className="empty-state">Loading option data...</div>
      ) : (
        <div className="manage-grid">
          {lookupConfigs.map((config) => (
            <div key={config.type} className="manage-card">
              <div className="manage-card-header">
                <h3>{config.title}</h3>
                <p>{config.description}</p>
              </div>

              <div className="form-group">
                <label htmlFor={`${config.type}-input`}>{config.placeholder}</label>
                <input
                  id={`${config.type}-input`}
                  type="text"
                  value={inputs[config.type]}
                  onChange={(event) => handleChange(config.type, event.target.value)}
                  placeholder={config.placeholder}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSubmit(config.type)}
                disabled={savingType === config.type}
              >
                {savingType === config.type ? 'Saving...' : config.buttonLabel}
              </button>

              <div className="manage-card-list">
                <p className="manage-card-list-title">Recently added</p>
                {lookups[config.type]?.length ? (
                  <ul>
                    {lookups[config.type].slice(-5).reverse().map((entry) => (
                      <li key={entry.id}>{entry.value}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">No values yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ManageOptionsPage;


