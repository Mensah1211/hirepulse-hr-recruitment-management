import React, { useState, useEffect } from "react";
import { User, UserStatus, PermissionLevel } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Users, Shield, UserX, UserCheck, Plus, Trash2, Mail, Phone, Building2, CheckCircle2 } from "lucide-react";

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.permissionLevel === "super_admin";

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleTab, setRoleTab] = useState<"applicant" | "admin">("applicant");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers(roleTab);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleTab]);

  const handleToggleStatus = async (user: User) => {
    if (user.role === "admin" && !isSuperAdmin) {
      alert("HR Staff members can only view other HR staff and cannot modify their account status.");
      return;
    }
    const newStatus: UserStatus = user.status === "active" ? "deactivated" : "active";
    await api.updateUserStatus(user.id, newStatus);
    await fetchUsers();
  };

  const handleUpdatePermission = async (targetUser: User, newLevel: PermissionLevel) => {
    if (!isSuperAdmin) {
      alert("HR Staff members cannot modify HR Staff permission levels.");
      return;
    }
    try {
      await api.updateUserPermission(targetUser.id, newLevel);
      await fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role === "admin" && !isSuperAdmin) {
      alert("HR Staff members cannot delete HR Staff accounts.");
      return;
    }
    if (confirm("Are you sure you want to delete this user account?")) {
      await api.deleteUser(id);
      await fetchUsers();
    }
  };

  // Add HR staff functionality removed

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage applicant accounts and activate/deactivate access.
          </p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setRoleTab("applicant")}
          className={`pb-3 font-bold text-xs sm:text-sm px-6 border-b-2 transition-colors flex items-center gap-2 ${
            roleTab === "applicant"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Job Seekers (Applicants)
        </button>

        <button
          onClick={() => setRoleTab("admin")}
          className={`pb-3 font-bold text-xs sm:text-sm px-6 border-b-2 transition-colors flex items-center gap-2 ${
            roleTab === "admin"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          HR Administrators & Staff
        </button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">Loading user accounts...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">User Details</th>
                  <th className="px-4 py-3.5">Contact Email & Phone</th>
                  <th className="px-4 py-3.5">Role / Permission</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-slate-800 font-semibold">{u.email}</p>
                      <p className="text-[11px] text-slate-500">{u.phone || "No phone provided"}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {u.role === "admin" ? (
                        isSuperAdmin && u.permissionLevel !== "super_admin" ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={u.permissionLevel || "hr_staff"}
                              onChange={(e) => handleUpdatePermission(u, e.target.value as PermissionLevel)}
                              className="text-xs font-bold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                              <option value="hr_staff">HR Staff</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border border-slate-200">
                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                            {u.permissionLevel === "super_admin" ? "Super Admin" : "HR Staff"}
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold capitalize">
                          Job Seeker
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          u.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.permissionLevel === "super_admin" ? (
                        <span className="text-xs font-semibold text-slate-400 italic px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                          Restricted
                        </span>
                      ) : u.role === "admin" && !isSuperAdmin ? (
                        <span className="text-xs font-semibold text-slate-400 italic px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                          Read-Only Access
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                              u.status === "active"
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {u.status === "active" ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Activate
                              </>
                            )}
                          </button>

                          {u.role === "applicant" && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
