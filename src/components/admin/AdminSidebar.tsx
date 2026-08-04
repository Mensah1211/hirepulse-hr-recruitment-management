import React from "react";
import { useAuth } from "../../context/AuthContext";
import { HirePulseLogo } from "../common/HirePulseLogo";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Calendar, 
  Users, 
  Send, 
  X, 
  LogOut,
  ChevronRight,
  User as UserIcon
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      desc: "Overview & Analytics",
    },
    {
      id: "jobs_admin",
      label: "Job Requisitions",
      icon: Briefcase,
      badge: "12 Open",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      desc: "Post & Manage Roles",
    },
    {
      id: "applications_admin",
      label: "Applications",
      icon: FileText,
      badge: "6 New",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      desc: "Review & Shortlist",
    },
    {
      id: "interviews_admin",
      label: "Interview Schedule",
      icon: Calendar,
      badge: "4 Today",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Calendar & Notes",
    },
    {
      id: "users_admin",
      label: "User Accounts",
      icon: Users,
      badge: null,
      desc: "Team & Permissions",
    },
    {
      id: "broadcast_admin",
      label: "Broadcast Center",
      icon: Send,
      badge: "Live",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Announcements & Comms",
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Slidebar Drawer (Light Mode) */}
      <aside
        className="fixed top-0 left-0 z-50 h-screen w-80 bg-white text-slate-800 shadow-2xl flex flex-col border-r border-slate-200 transition-transform duration-300 ease-in-out"
      >
        {/* Drawer Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 shrink-0">
          <HirePulseLogo variant="light" size="sm" />

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div 
            onClick={() => {
              setActiveTab("profile");
              setIsOpen(false);
            }}
            className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 hover:bg-indigo-50/60 transition-colors cursor-pointer flex items-center gap-3 shrink-0 group"
          >
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize truncate flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-indigo-500" />
                My Profile & Account
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1">
            Admin Modules
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-200/80"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />

                <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className={`text-[10px] ${isActive ? "text-indigo-100" : "text-slate-500"}`}>{item.desc}</p>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? "bg-indigo-700 text-white border-indigo-500" : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isActive ? "text-white" : "text-slate-300 group-hover:text-indigo-600"}`} />
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 space-y-2 bg-slate-50/60 shrink-0">
          <button
            onClick={() => {
              setActiveTab("broadcast_admin");
              setIsOpen(false);
            }}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full py-2 px-3 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};


