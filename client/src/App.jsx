import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AddTaskPage from './pages/AddTaskPage.jsx';
import TaskListPage from './pages/TaskListPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ManageOptionsPage from './pages/ManageOptionsPage.jsx';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks/new" replace />} />
          <Route path="/tasks/new" element={<AddTaskPage />} />
          <Route path="/tasks/:taskId/edit" element={<AddTaskPage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/manage" element={<ManageOptionsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
