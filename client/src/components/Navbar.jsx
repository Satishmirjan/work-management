import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X, CheckSquare, BarChart3, Settings, PlusSquare, LogOut, LogIn, Lock, ChevronDown, User } from "lucide-react"
import { useAuth } from "../context/AuthContext.jsx"
import ChangePasswordModal from "./ChangePasswordModal.jsx"

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const userMenuRef = useRef(null)
  const { scrollY } = useScroll()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  const navItems = [
    { path: "/tasks/new", label: "Add Task", icon: <PlusSquare className="w-4 h-4" />, requiresAuth: true },
    { path: "/tasks", label: "Task List", icon: <CheckSquare className="w-4 h-4" />, requiresAuth: true },
    { path: "/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, requiresAuth: true },
    { path: "/manage", label: "Manage Options", icon: <Settings className="w-4 h-4" />, requiresAuth: true, roles: ["admin"] },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      {/* Header */}
      <motion.header
        className={`sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-slate-950/90 via-indigo-900/40 to-slate-950/90 backdrop-blur-2xl transition-all duration-500 ${
          isScrolled ? "shadow-[0_10px_50px_rgba(15,23,42,0.55)]" : ""
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-2 shadow-2xl"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ duration: 0.3 }}
            >
             

            </motion.div>
            <img
    src="./jk-favicon.jpg"
    alt="Logo"
    className="w-10 h-10 cursor-pointer"
  />
            <div className="leading-tight">
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-200 bg-clip-text text-xl font-bold text-transparent">
               Daily Work Management : <br></br>
               TBR Platform     
              </span>
              <p className="text-xs tracking-wide text-slate-300">Manage • Analyze • Track</p>
            </div>
          </Link>

          {/* Desktop Navbar */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems
              .filter((item) => {
                if (item.roles && (!user || !item.roles.includes(user.role))) {
                  return false
                }
                return true
              })
              .map((item, i) => {
                const active = location.pathname === item.path
                const destination = user || !item.requiresAuth ? item.path : "/login"
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={destination} className="group relative flex items-center gap-2 rounded-2xl px-4 py-2">
                    <span
                      className={`relative z-10 flex items-center gap-1 text-sm font-medium
                      ${
                        active
                          ? "text-white"
                          : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {item.icon} {item.label}
                    </span>

                    {active && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-[1px]"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
            <div className="ml-4 flex items-center gap-3">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">{user.displayName}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700">
                          {user.displayName}
                          {user.role === 'admin' && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">
                              Admin
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            setIsChangePasswordOpen(true)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          Change Password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-2xl border border-indigo-500/70 px-4 py-2 text-sm text-white bg-indigo-600/70 hover:bg-indigo-600"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="rounded-xl border border-white/20 p-2 text-white transition hover:bg-white/10 md:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left"
          style={{ scaleX: useTransform(scrollY, [0, 800], [0, 1]) }}
        />
      </motion.header>

      {/* Mobile Sidebar */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isMobileOpen ? 1 : 0 }}
        style={{ pointerEvents: isMobileOpen ? "auto" : "none" }}
        onClick={() => setIsMobileOpen(false)}
      >
        <motion.div
          className="absolute right-0 top-0 h-full w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700 shadow-xl p-6"
          initial={{ x: "100%" }}
          animate={{ x: isMobileOpen ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-semibold text-lg">Menu</h3>
            <button className="rounded-lg border border-white/20 p-2" onClick={() => setIsMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {navItems
              .filter((item) => {
                if (item.roles && (!user || !item.roles.includes(user.role))) {
                  return false
                }
                return true
              })
              .map((item) => {
                const active = location.pathname === item.path
                const destination = user || !item.requiresAuth ? item.path : "/login"
              return (
                <Link
                  key={item.path}
                  to={destination}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    active
                      ? "bg-indigo-500/20 text-white"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 space-y-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false)
                    setIsChangePasswordOpen(true)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-500/70 bg-indigo-600/80 px-4 py-3 text-white"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
    </>
  )
}
