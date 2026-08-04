import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NotificationDropdown } from "./common/NotificationDropdown";
import { AuthModal } from "./common/AuthModal";
import { HirePulseLogo } from "./common/HirePulseLogo";
import { 
  Briefcase, 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  Send,
  Zap
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateToAppDetail?: (appId?: string) => void;
  onToggleAdminMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNavigateToAppDetail,
  onToggleAdminMobileSidebar
}) => {
  const { user, profile, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Main Navbar Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Menu Toggle Button */}
            <div className="flex items-center gap-3">
              {isAdmin && onToggleAdminMobileSidebar && (
                <button
                  onClick={onToggleAdminMobileSidebar}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                  title="Open Admin Slidebar Menu"
                >
                  <Menu className="w-4 h-4 text-indigo-400" />
                  <span>Menu</span>
                </button>
              )}

              <button 
                onClick={() => setActiveTab(isAdmin ? "dashboard" : "jobs")}
                className="group focus:outline-none"
              >
                <HirePulseLogo size="md" variant="light" />
              </button>

              {/* Navigation Links for Applicant (Desktop) */}
              {!isAdmin && (
                <nav className="hidden md:flex items-center gap-1 ml-6">
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "jobs" ? "bg-indigo-50 text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Explore Jobs
                  </button>
                  {user && (
                    <button
                      onClick={() => setActiveTab("my_applications")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === "my_applications" ? "bg-indigo-50 text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      My Applications
                    </button>
                  )}
                </nav>
              )}
            </div>

            {/* Right Controls (Notification Bell & Profile Menu) */}
            <div className="flex items-center gap-3">
              {user && <NotificationDropdown onNavigateToApplication={onNavigateToAppDetail} />}

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-2 divide-y divide-slate-100 text-xs">
                        {/* Profile Header */}
                        <div className="px-4 py-3 bg-slate-50/50 flex items-center gap-3">
                          <img
                            src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setActiveTab("profile");
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-semibold"
                          >
                            <UserIcon className="w-4 h-4 text-indigo-500" />
                            My Profile & Account
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab("jobs");
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Sign In / Register
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-20 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-30 md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {isAdmin ? (
              <>
                <button
                  onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab("jobs_admin"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Manage Jobs
                </button>
                <button
                  onClick={() => { setActiveTab("applications_admin"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Applications
                </button>
                <button
                  onClick={() => { setActiveTab("interviews_admin"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Interviews
                </button>
                <button
                  onClick={() => { setActiveTab("users_admin"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  User Accounts
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab("jobs"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Browse Jobs
                </button>
                {user && (
                  <>
                    <button
                      onClick={() => { setActiveTab("my_applications"); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      My Applications
                    </button>
                    <button
                      onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      My Profile
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};
