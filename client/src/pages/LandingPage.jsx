import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  CheckSquare,
  ClipboardList,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react';

const stats = [
  { label: 'Tasks tracked', value: '12K+', icon: ClipboardList },
  { label: 'Teams onboarded', value: '140+', icon: Users },
  { label: 'Automation boost', value: '38%', icon: Sparkles },
];

const features = [
  {
    title: 'Guided task capture',
    description:
      'Pre-built options, smart defaults, and validation keep every worklog consistent and audit ready.',
    icon: CheckSquare,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
  {
    title: 'Timeline intelligence',
    description:
      'Compare planned and actual dates instantly so you can spot slips before they snowball.',
    icon: CalendarClock,
    gradient: 'from-cyan-500 to-emerald-500',
  },
  {
    title: 'Insightful analytics',
    description:
      'Beautiful dashboards reveal throughput, blockers, and utilization without exporting a single sheet.',
    icon: LineChart,
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
];

const workflow = [
  {
    title: 'Capture work',
    copy: 'Record effort with milestones, people, and activities in one elegant form.',
  },
  {
    title: 'Automate reviews',
    copy: 'Alerts and status rules flag anything that needs attention.',
  },
  {
    title: 'Share insights',
    copy: 'Live analytics keep leadership, finance, and delivery aligned.',
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-40"
          animate={{ background: ['radial-gradient(circle at 20% 20%, #2563eb33, transparent 60%)', 'radial-gradient(circle at 80% 20%, #ec489933, transparent 60%)'] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />

        <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-32 text-center md:px-12">
          <motion.span
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm uppercase tracking-wide text-slate-200 shadow-lg shadow-blue-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Work Manager 2.0
          </motion.span>

          <motion.h1
            className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Align every task, person, and milestone in a single curated workspace.
          </motion.h1>

          <motion.p
            className="mx-auto max-w-3xl text-lg text-slate-300 md:text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Capture daily work, orchestrate schedules, and surface insights that keep your delivery rhythm smooth—without spreadsheets or status-chasing.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/tasks/new"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/40 transition hover:brightness-110"
            >
              Start logging work
              <Workflow className="ml-3 h-5 w-5" />
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-3 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Explore analytics
              <LineChart className="ml-3 h-5 w-5" />
            </Link>
          </motion.div>

          <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-6 md:grid-cols-3">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
                  <Icon className="mb-4 h-8 w-8 text-cyan-300" />
                  <div className="text-3xl font-bold">{value}</div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-12">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Designed for clarity</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Luxury-grade workflow for everyday execution</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon, gradient }) => (
            <motion.div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.45)]"
              whileHover={{ y: -6 }}
            >
              <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${gradient} p-4`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-slate-300">{description}</p>
              <div className={`pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-20 bg-gradient-to-br ${gradient}`} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.6)]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">How it flows</p>
              <h2 className="mt-3 text-3xl font-semibold">A streamlined rhythm for every squad</h2>
            </div>
            <ShieldCheck className="h-12 w-12 text-emerald-300" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-slate-300">{item.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-8 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <p className="text-lg text-slate-200">
                “Work Manager replaced four separate spreadsheets and made status reviews feel luxe. We ship updates two days faster every week.”
              </p>
              <p className="mt-2 text-sm uppercase tracking-wide text-slate-400">Program Director, JK Tyre innovation lab</p>
            </div>
            <Link
              to="/tasks"
              className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
            >
              View task board
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;




