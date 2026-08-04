import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, ApplicantProfile, Notification } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  profile: ApplicantProfile | null;
  token: string | null;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; role?: string; permissionLevel?: string; department?: string; avatarUrl?: string; password?: string }) => Promise<void>;
  logout: () => void;
  switchPersona: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS = [
  { label: "Admin (Eleanor Vance)", email: "hr.admin@hirepulse.com", role: "admin", roleBadge: "Super Admin" },
  { label: "HR Staff (Sarah Jenkins)", email: "sarah.hr@hirepulse.com", role: "admin", roleBadge: "HR Staff" },
  { label: "Applicant (John Doe)", email: "john.doe@example.com", role: "applicant", roleBadge: "Senior Engineer Candidate" },
  { label: "Applicant (Alex Morgan)", email: "alex.morgan@example.com", role: "applicant", roleBadge: "UX Designer Candidate" },
  { label: "Applicant (Michael Chen)", email: "michael.chen@example.com", role: "applicant", roleBadge: "DevOps Candidate" }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize with saved token
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedEmail = localStorage.getItem("hirepulse_demo_email");
      const savedPassword = localStorage.getItem("hirepulse_demo_password");
      
      if (savedEmail && savedPassword) {
        const res = await api.login(savedEmail, savedPassword);
        setUser(res.user);
        setProfile(res.profile);
        setToken(res.token);

        const notifs = await api.getNotifications(res.user.id);
        setNotifications(notifs);
      } else {
        // Not logged in
        setUser(null);
        setProfile(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to initialize auth:", err);
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications(user.id);
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getProfile(user.id);
      setUser(res.user);
      setProfile(res.profile);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setProfile(res.profile);
    setToken(res.token);
    localStorage.setItem("hirepulse_demo_email", res.user.email);
    if (password) localStorage.setItem("hirepulse_demo_password", password);
    
    const notifs = await api.getNotifications(res.user.id);
    setNotifications(notifs);
  };

  const register = async (data: { name: string; email: string; phone?: string; role?: string; permissionLevel?: string; department?: string; avatarUrl?: string; password?: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    setProfile(res.profile);
    setToken(res.token);
    localStorage.setItem("hirepulse_demo_email", res.user.email);
    if (data.password) localStorage.setItem("hirepulse_demo_password", data.password);
    setNotifications([]);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    setNotifications([]);
    localStorage.removeItem("hirepulse_demo_email");
    localStorage.removeItem("hirepulse_demo_password");
  };

  const switchPersona = async (email: string) => {
    await login(email);
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await api.markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      notifications,
      unreadCount,
      isLoading,
      login,
      register,
      logout,
      switchPersona,
      refreshProfile,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
