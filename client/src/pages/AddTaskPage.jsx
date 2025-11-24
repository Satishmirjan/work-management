import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Target,
  Activity,
  Clock,
  Save,
  X,
  Sparkles
} from 'lucide-react';
import {
  defaultProjects,
  defaultPeople,
  defaultMilestones,
  defaultActivities
} from "../constants/options";
import { createTask, fetchTask, fetchTaskOptions, updateTask } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const todayString = () => new Date().toISOString().split('T')[0];

const buildInitialForm = () => ({
  name: '',
  workDate: todayString(),
  person: '',
  project: '',
  milestone: 'None',
  genericActivity: '',
  plannedStart: '',
  plannedEnd: '',
  actualStart: '',
  actualEnd: '',
});

// const defaultProjects = [
//   'Projects Casing durability',
//   'RFID PID',
//   'TREEL TT',
//   'TREEL TL',
//   'Accelerated testing',
//   'Training',
//   'Bald',
//   'Mold',
//   '9.00R20 field testing'
// ];

// const defaultPeople = ['Prajwal C', 'Satish', 'Keerthana'];

// const defaultMilestones = [
//   'None',
//   'Initiate NDR Review Process',
//   'Start Business case review & approval - Gate 1',
//   'Start Detailed design review - Gate 2 sign off',
//   'Start Proto sign off - Gate 3 sign off',
//   'Start FDR / PRN - Gate 4',
//   'Market feedback - Gate 5'
// ];

// const defaultActivities = [
//   'VOC - Market research',
//   'VOC - Historical Warranty & Quality Information.',
//   'VOC - Team experience',
//   'CFT formation',
//   'Customer inputs - CFT visit',
//   'Business Plan / Marketing Strategy.',
//   'Benchmark identification',
//   'Primary feasibility study',
//   'Business case preparation',
//   'Capex approval',
//   'Timing chart preparation & alignment- PQPTC',
//   'Preliminary product benchmarking',
//   'Build house of quality (QFD)',
//   'Concept preparation',
//   'Concept review & sign off',
//   'Project cover sheet & DVP input',
//   'Prepare DFMEA',
//   'Manufacturing Feasibility sign off input',
//   'Manufacturing Feasibility sign off from plant',
//   'Risk analysis',
//   'Feasibility & risk assessment review',
//   'Final RACE approval with WBS number',
//   'Preparation of basic design',
//   'Basic design review',
//   'Detailed design & simulation',
//   'Review of simulation results',
//   'Preparation of engineering drawings & sign off',
//   'Create PR',
//   'PR approval',
//   'Mold drawings to vendor',
//   'Vendor selection & PO release',
//   'Mold manufacturing',
//   'Mold inspection',
//   'Creation of product code',
//   'Design specification prep - proto run',
//   'Manufacturing specification prep',
//   'Building & curing prep - proto run',
//   'BOM / Routing',
//   'Costing',
//   'Product code extension',
//   'PFMEA preparation',
//   'Mold inspection & release',
//   'Proto run',
//   'DVP Plant',
//   'DVP Hasetri',
//   'Compilation of proto results',
//   'Review of proto results',
//   'Packaging specification',
//   'Sample submission',
//   'Pilot production',
//   'Review of pilot results',
//   'PTG test plan',
//   'Dispatch test tyres',
//   'Fitment test tyres',
//   'Field evaluations',
//   'Commercial production release',
//   'Capture Post release feedback'
// ];

const buildOptions = (fallback = [], fetched = []) => {
  const merged = [...new Set([...fallback, ...(fetched ?? [])])].filter(Boolean);
  return merged.length ? merged : fallback;
};

function AddTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState(buildInitialForm);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [options, setOptions] = useState({
    projects: defaultProjects,
    people: defaultPeople,
    milestones: defaultMilestones,
    genericActivities: defaultActivities,
  });
  const isEditMode = Boolean(taskId);

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    if (!taskId) {
      setForm(buildInitialForm());
      return;
    }

    const loadTask = async () => {
      setLoadingTask(true);
      setAlert(null);
      try {
        const data = await fetchTask(taskId);

        const ownerId =
          typeof data.createdBy === 'string'
            ? data.createdBy
            : data.createdBy?._id || data.createdBy?.id;
        const isOwner = ownerId && user ? ownerId === user.id : false;
        const isAdmin = user?.role === 'admin';

        if (!isOwner && !isAdmin) {
          setAlert({ type: 'error', message: 'You can only edit tasks you created.' });
          navigate('/tasks', { replace: true });
          return;
        }

        setForm({
          name: data.name || '',
          workDate: data.workDate ? dayjs(data.workDate).format('YYYY-MM-DD') : todayString(),
          person: data.person || '',
          project: data.project || '',
          milestone: data.milestone || 'None',
          genericActivity: data.genericActivity || '',
          plannedStart: data.plannedStart ? dayjs(data.plannedStart).format('YYYY-MM-DD') : '',
          plannedEnd: data.plannedEnd ? dayjs(data.plannedEnd).format('YYYY-MM-DD') : '',
          actualStart: data.actualStart ? dayjs(data.actualStart).format('YYYY-MM-DD') : '',
          actualEnd: data.actualEnd ? dayjs(data.actualEnd).format('YYYY-MM-DD') : '',
        });
      } catch (error) {
        console.error('Failed to load task', error);
        const message = error?.response?.data?.message || 'Unable to load task details.';
        setAlert({ type: 'error', message });
      } finally {
        setLoadingTask(false);
      }
    };

    loadTask();
  }, [taskId, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.name || !form.person || !form.project || !form.genericActivity || !form.workDate) {
      setAlert({ type: 'error', message: 'Please fill in all required fields (Task Name, Person, Project, Generic Activity, and Date).' });
      return;
    }

    setAlert(null);
    setSaving(true);

    try {
      if (isEditMode) {
        await updateTask(taskId, form);
        setAlert({ type: 'success', message: 'Task updated successfully!' });
      } else {
        await createTask(form);
        setAlert({ type: 'success', message: 'Task saved successfully!' });
      }

      setTimeout(() => {
        navigate('/tasks');
      }, 1200);
    } catch (error) {
      console.error('Failed to save task', error);
      const message = error?.response?.data?.message || error?.message || 'Could not save task. Please try again.';
      setAlert({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-8">

      {/* Fix styles (same as yours, no change) */}
      <style>{`
        .input-field {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .input-field:hover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
          transform: translateY(-2px);
        }
        .input-field:focus {
          outline: none;
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.08);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className={`mb-8 ${mounted ? 'animate-slide-down' : 'opacity-0'}`}>
          <button 
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 text-slate-400 hover:text-violet-400 mb-6 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="font-medium">Back to Tasks</span>
          </button>

          <div className="relative overflow-hidden rounded-3xl p-12 shadow-2xl bg-gradient-to-br from-violet-800/40 to-indigo-900/40 backdrop-blur-xl border border-violet-400/20">
            <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-300/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-300 animate-pulse" />
                <span className="text-xs font-semibold text-violet-200">WORK MANAGER 2.0</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-3">{isEditMode ? 'Edit Task / Activity' : 'Add Task / Activity'}</h1>
            <p className="text-slate-300 text-lg max-w-3xl">
              Capture daily work, orchestrate schedules, and surface insights.
            </p>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`mb-6 p-5 rounded-2xl border-2 shadow-xl ${
            alert.type === 'success' 
              ? 'bg-green-500/20 border-green-500/40 text-green-200' 
              : 'bg-red-500/20 border-red-500/40 text-red-200'
          }`}>
            {alert.message}
          </div>
        )}

        {loadingTask && (
          <div className="mb-6 p-5 rounded-2xl border-2 border-blue-500/40 bg-blue-500/10 text-blue-100 shadow-xl">
            Loading task details...
          </div>
        )}

        {/* FORM CARD */}
        <div className="rounded-3xl shadow-2xl p-8 mb-6 bg-slate-900/40 border border-violet-500/20 backdrop-blur-xl">

          {/* Icon & Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Basic Information</h2>
              <p className="text-slate-400 text-sm mt-1">Core details about your task</p>
            </div>
          </div>

          {/* INPUT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* FIXED — Task Name */}
            <div className="md:col-span-2">
              <label className="text-slate-300 font-semibold">Task Name</label>
              <div className="relative mt-2">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300 w-10 flex justify-center">
                  <Activity className="w-5 h-5" />
                </div>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />
              </div>
            </div>

            {/* FIXED — Date */}
            <div>
              <label className="text-slate-300 font-semibold">Today's Date</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-violet-300 flex justify-center">
                  <Calendar className="w-5 h-5" />
                </div>

                <input
                  type="date"
                  name="workDate"
                  value={form.workDate}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />
              </div>
            </div>

            {/* FIXED — Person */}
            <div>
              <label className="text-slate-300 font-semibold">Person</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-violet-300 flex justify-center">
                  <User className="w-5 h-5" />
                </div>

                <input
                  name="person"
                  list="people-options"
                  value={form.person}
                  onChange={handleChange}
                  placeholder="Who is responsible?"
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />

                <datalist id="people-options">
                  {options.people.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
            </div>

            {/* FIXED — Project */}
            <div>
              <label className="text-slate-300 font-semibold">Project</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-violet-300 flex justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>

                <select
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white cursor-pointer"
                >
                  <option value="" disabled>Select a project</option>
                  {options.projects.map(p => (
                    <option key={p} value={p} className="bg-slate-900">{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* FIXED — Milestone */}
            <div>
              <label className="text-slate-300 font-semibold">Milestone</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-violet-300 flex justify-center">
                  <Target className="w-5 h-5" />
                </div>

                <select
                  name="milestone"
                  value={form.milestone}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white cursor-pointer"
                >
                  {options.milestones.map(m => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* FIXED — Generic Activity */}
            <div>
              <label className="text-slate-300 font-semibold">Generic Activity</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-violet-300 flex justify-center">
                  <Activity className="w-5 h-5" />
                </div>

                <select
                  name="genericActivity"
                  value={form.genericActivity}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white cursor-pointer"
                >
                  <option value="" disabled>Select activity type</option>
                  {options.genericActivities.map(a => (
                    <option key={a} value={a} className="bg-slate-900">{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE SECTION */}
        <div className="rounded-3xl shadow-2xl p-8 mb-8 bg-slate-900/40 border border-blue-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Timeline & Dates</h2>
              <p className="text-slate-400 text-sm mt-1">Plan and track execution dates</p>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Planned Start */}
            <div>
              <label className="text-slate-300 font-semibold">Planned Start Date</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-blue-300 flex justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  name="plannedStart"
                  value={form.plannedStart}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />
              </div>
            </div>

            {/* Planned End */}
            <div>
              <label className="text-slate-300 font-semibold">Planned End Date</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-blue-300 flex justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  name="plannedEnd"
                  value={form.plannedEnd}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />
              </div>
            </div>

            {/* Actual Start */}
            <div>
              <label className="text-slate-300 font-semibold">Actual Start Date</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-blue-300 flex justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  name="actualStart"
                  value={form.actualStart}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />
              </div>
            </div>

            {/* Actual End */}
            <div>
              <label className="text-slate-300 font-semibold">Actual End Date</label>
              <div className="relative mt-2">
                <div className="absolute w-10 left-3 top-1/2 -translate-y-1/2 text-blue-300 flex justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  name="actualEnd"
                  value={form.actualEnd}
                  onChange={handleChange}
                  className="input-field w-full pl-16 pr-5 py-4 border-2 border-slate-700 bg-slate-800/50 rounded-2xl text-white"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-5 justify-end">
          <button
            className="px-10 py-4 bg-slate-800/80 border-2 border-slate-600 text-slate-300 font-bold rounded-2xl hover:bg-slate-700/80 hover:border-slate-500 flex items-center gap-3 shadow-xl"
            onClick={() => (isEditMode ? navigate('/tasks') : setForm(buildInitialForm()))}
          >
            <X className="w-6 h-6" />
            Cancel
          </button>

          <button
            disabled={saving || loadingTask}
            onClick={handleSubmit}
            className={`px-10 py-4 text-white font-bold rounded-2xl flex items-center gap-3 shadow-2xl ${
              saving ? 'animate-pulse bg-violet-600/60' : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            <Save className={`w-6 h-6 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : isEditMode ? 'Update Task' : 'Start logging work'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTaskPage;
