import React, { useState, useEffect } from "react";
import { User, NotificationType } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Send, Users, CheckCircle2, Shield, UserCheck, Building2, UserX } from "lucide-react";

export const NotificationBroadcast: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [targetGroup, setTargetGroup] = useState<"all_applicants" | "all_hr" | "everyone" | "single">("all_applicants");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("Corporate HR Update");
  const [message, setMessage] = useState("Thank you for your dedication to HirePulse recruitment processes. Our talent team has updated company guidelines.");
  const [type, setType] = useState<NotificationType>("info");

  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.permissionLevel === "super_admin";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await api.getUsers();
        setAllUsers(users);
        if (users.length > 0) setSelectedUserId(users[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const applicants = allUsers.filter((u) => u.role === "applicant");
  const hrStaff = allUsers.filter((u) => u.role === "admin");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSuccessMsg(null);

    try {
      let targetIds: string[] = [];
      if (targetGroup === "all_applicants") {
        targetIds = applicants.map((a) => a.id);
      } else if (targetGroup === "all_hr") {
        targetIds = hrStaff.map((h) => h.id);
      } else if (targetGroup === "everyone") {
        targetIds = allUsers.map((u) => u.id);
      } else {
        if (selectedUserId) targetIds = [selectedUserId];
      }

      const res = await api.sendNotification(targetIds, title, message, type);
      setSuccessMsg(`Successfully dispatched notification broadcast to ${res.sentCount} user account(s).`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Notification & Email Broadcast Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dispatch announcements, corporate updates, and candidate notices across HR Staff and Applicants.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            Super HR Broadcast Access
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        
        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4 text-xs sm:text-sm">
          
          <div>
            <label className="block font-bold text-slate-800 mb-2">Audience Target</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              <button
                type="button"
                onClick={() => setTargetGroup("all_applicants")}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  targetGroup === "all_applicants"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Applicants ({applicants.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetGroup("all_hr")}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  targetGroup === "all_hr"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <Shield className="w-3 h-3 text-indigo-600" />
                </div>
                <span>HR Staff ({hrStaff.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetGroup("everyone")}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  targetGroup === "everyone"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Everyone ({allUsers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetGroup("single")}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  targetGroup === "single"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Specific Person</span>
              </button>

            </div>
          </div>

          {targetGroup === "single" && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Recipient</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
              >
                <optgroup label="HR Staff & Management">
                  {hrStaff.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.email}) - {h.permissionLevel === "super_admin" ? "Super Admin" : "HR Staff"}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Job Seekers / Applicants">
                  {applicants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notification Priority / Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
              >
                <option value="info">Information (Blue)</option>
                <option value="status_change">Status Update (Purple)</option>
                <option value="interview">Interview Announcement (Indigo)</option>
                <option value="success">Success / Offer (Green)</option>
                <option value="warning">Alert / Notice (Rose)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Dispatching Broadcast..." : "Send Notification Broadcast"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

