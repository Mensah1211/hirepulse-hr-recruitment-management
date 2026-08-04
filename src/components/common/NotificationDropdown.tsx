import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, Calendar, ExternalLink } from "lucide-react";

interface NotificationDropdownProps {
  onNavigateToApplication?: (appId?: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigateToApplication }) => {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case "interview":
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.readStatus) markNotificationRead(n.id);
                      if (n.relatedApplicationId && onNavigateToApplication) {
                        onNavigateToApplication(n.relatedApplicationId);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3.5 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !n.readStatus ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg shrink-0 h-fit">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold ${!n.readStatus ? "text-slate-900" : "text-slate-700"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      {n.relatedApplicationId && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium mt-1">
                          View details <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
