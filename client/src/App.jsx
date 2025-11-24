import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AddTaskPage from './pages/AddTaskPage.jsx';
import TaskListPage from './pages/TaskListPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ManageOptionsPage from './pages/ManageOptionsPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  const location = useLocation();
  const mainClassName = location.pathname === '/' ? 'landing-main' : 'app-main';

  return (
    <div className="app-shell">
      <Navbar />
      <main className={mainClassName}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute>
                <AddTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId/edit"
            element={
              <ProtectedRoute>
                <AddTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageOptionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
