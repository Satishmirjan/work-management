import { useEffect, useState } from 'react';
import { createLookupValue, deleteLookupValue, fetchLookups } from '../services/lookupService';
import { fetchUsers, createUserAccount } from '../services/userService';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [lookups, setLookups] = useState(defaultLookupState);
  const [inputs, setInputs] = useState(defaultInputState);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [savingType, setSavingType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [userSaving, setUserSaving] = useState(false);
  const [userAlert, setUserAlert] = useState(null);

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

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
      setUserAlert({ type: 'error', message: 'Unable to load users.' });
    }
  };

  useEffect(() => {
    loadLookups();
    loadUsers();
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

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this option?')) {
      return;
    }

    setDeletingId(entryId);
    setAlert(null);
    try {
      await deleteLookupValue(entryId);
      await loadLookups();
      setAlert({ type: 'success', message: 'Option removed successfully.' });
    } catch (error) {
      console.error('Failed to delete lookup', error);
      const message = error?.response?.data?.message || 'Could not delete value.';
      setAlert({ type: 'error', message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUserInputChange = (event) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
    if (!userForm.displayName.trim() || !userForm.username.trim() || !userForm.password.trim()) {
      setUserAlert({ type: 'error', message: 'Display name, username, and password are required.' });
      return;
    }

    setUserSaving(true);
    setUserAlert(null);
    try {
      await createUserAccount({
        displayName: userForm.displayName,
        username: userForm.username,
        email: userForm.email || undefined,
        password: userForm.password,
        role: userForm.role,
      });
      setUserForm({
        displayName: '',
        username: '',
        email: '',
        password: '',
        role: 'user',
      });
      await loadUsers();
      setUserAlert({ type: 'success', message: 'User created successfully.' });
    } catch (error) {
      console.error('Failed to create user', error);
      const message = error?.response?.data?.message || 'Could not create user.';
      setUserAlert({ type: 'error', message });
    } finally {
      setUserSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="empty-state">Only administrators can manage lookup options.</div>;
  }

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
        {userAlert && (
          <div className={`alert ${userAlert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
            {userAlert.message}
          </div>
        )}
      </div>

      <div className="manage-grid" style={{ marginBottom: '2rem' }}>
        <div className="manage-card" style={{ gridColumn: '1 / -1' }}>
          <div className="manage-card-header">
            <h3>Create User Account</h3>
            <p>Invite teammates by creating their login credentials.</p>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                name="displayName"
                value={userForm.displayName}
                onChange={handleUserInputChange}
                placeholder="e.g. Satish Kumar"
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" value={userForm.username} onChange={handleUserInputChange} placeholder="e.g. satish" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleUserInputChange}
                placeholder="name@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={userForm.password}
                onChange={handleUserInputChange}
                placeholder="Temporary password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={userForm.role} onChange={handleUserInputChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCreateUser} disabled={userSaving}>
            {userSaving ? 'Creating...' : 'Create User'}
          </button>

          <div className="manage-card-list" style={{ marginTop: '1.5rem' }}>
            <p className="manage-card-list-title">Existing Users</p>
            {users.length ? (
              <ul>
                {users.map((entry) => (
                  <li key={entry._id || entry.id}>
                    <strong>{entry.displayName}</strong> — {entry.username}
                    {entry.role === 'admin' ? ' (Admin)' : ''}
                    {entry.email ? ` · ${entry.email}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No users found.</p>
            )}
          </div>
        </div>
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
                    {lookups[config.type]
                      .slice(-8)
                      .reverse()
                      .map((entry) => (
                        <li key={entry.id} className="flex items-center justify-between gap-3">
                          <span>{entry.value}</span>
                          <button
                            type="button"
                            className="icon-button delete"
                            title="Delete option"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                          >
                            ✕
                          </button>
                        </li>
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


