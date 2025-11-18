import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/tasks/new', label: 'Add Task' },
  { to: '/tasks', label: 'Task List' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/manage', label: 'Manage Options' },
];

function Navbar() {
  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <span role="img" aria-label="check">
          ✅
        </span>
        <span>Work Tracker</span>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;

