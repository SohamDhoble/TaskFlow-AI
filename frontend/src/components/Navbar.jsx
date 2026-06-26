import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark-card border-b border-dark-border z-40 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
          id="mobile-menu-toggle"
        >
          <Menu className="w-6 h-6 text-text-primary" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold gradient-text">TaskFlow</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-dark-card border-r border-dark-border z-40 flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TaskFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary/60">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'nav-active text-primary bg-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                }`
              }
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {item.label}
            </NavLink>
          ))}

          <p className="px-3 mt-6 mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary/60">
            Insights
          </p>
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-hover transition-all duration-200 group"
          >
            <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Analytics
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary/50 cursor-not-allowed">
            <Settings className="w-5 h-5" />
            Settings
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-dark-hover text-text-secondary">
              Soon
            </span>
          </div>
        </nav>

        {/* User profile section */}
        <div className="border-t border-dark-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {user?.email || 'user@email.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="logout-button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 btn-press"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
