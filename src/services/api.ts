import { 
  User, 
  ApplicantProfile, 
  Job, 
  Application, 
  Interview, 
  Notification, 
  AnalyticsSummary, 
  ApplicationStatus,
  InterviewOutcome,
  UserStatus,
  PermissionLevel
} from "../types";

const API_BASE = "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(email: string, password?: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ token: string; user: User; profile: ApplicantProfile | null }>(res);
  },

  async register(data: { name: string; email: string; phone?: string; role?: string; permissionLevel?: string; department?: string; avatarUrl?: string; password?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse<{ token: string; user: User; profile: ApplicantProfile | null }>(res);
  },

  async resetPassword(email: string) {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    return handleResponse<{ message: string }>(res);
  },

  // Profile
  async getProfile(userId: string) {
    const res = await fetch(`${API_BASE}/api/profile/${userId}`);
    return handleResponse<{ user: User; profile: ApplicantProfile }>(res);
  },

  async updateProfile(data: Partial<ApplicantProfile> & { userId: string; name?: string; phone?: string; avatarUrl?: string }) {
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse<{ user: User; profile: ApplicantProfile }>(res);
  },

  async uploadResume(userId: string, fileName: string, fileContentBase64?: string) {
    const res = await fetch(`${API_BASE}/api/profile/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, fileName, fileContentBase64 })
    });
    return handleResponse<{ success: boolean; resumeUrl: string; resumeFileName: string; resumeUploadedAt: string }>(res);
  },

  async uploadCoverLetter(userId: string, fileName: string, fileContentBase64?: string) {
    const res = await fetch(`${API_BASE}/api/profile/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, fileName, fileContentBase64 })
    });
    return handleResponse<{ success: boolean; coverLetterUrl: string; coverLetterFileName: string; coverLetterUploadedAt: string }>(res);
  },

  // Jobs
  async getJobs(params?: { search?: string; department?: string; locationType?: string; employmentType?: string; status?: string; salaryMin?: number }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append("search", params.search);
      if (params.department) query.append("department", params.department);
      if (params.locationType) query.append("locationType", params.locationType);
      if (params.employmentType) query.append("employmentType", params.employmentType);
      if (params.status) query.append("status", params.status);
      if (params.salaryMin) query.append("salaryMin", params.salaryMin.toString());
    }
    const res = await fetch(`${API_BASE}/api/jobs?${query.toString()}`);
    return handleResponse<Job[]>(res);
  },

  async getJobById(id: string) {
    const res = await fetch(`${API_BASE}/api/jobs/${id}`);
    return handleResponse<Job>(res);
  },

  async createJob(jobData: Partial<Job>) {
    const res = await fetch(`${API_BASE}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData)
    });
    return handleResponse<Job>(res);
  },

  async updateJob(id: string, jobData: Partial<Job>) {
    const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData)
    });
    return handleResponse<Job>(res);
  },

  async deleteJob(id: string) {
    const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
      method: "DELETE"
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Applications
  async applyToJob(data: { jobId: string; applicantId: string; coverLetter?: string; resumeUrl?: string; resumeFileName?: string; coverLetterUrl?: string; coverLetterFileName?: string }) {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse<Application>(res);
  },

  async getApplications(params?: { jobId?: string; applicantId?: string; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.jobId) query.append("jobId", params.jobId);
      if (params.applicantId) query.append("applicantId", params.applicantId);
      if (params.status) query.append("status", params.status);
      if (params.search) query.append("search", params.search);
    }
    const res = await fetch(`${API_BASE}/api/applications?${query.toString()}`);
    return handleResponse<Application[]>(res);
  },

  async getApplicationById(id: string) {
    const res = await fetch(`${API_BASE}/api/applications/${id}`);
    return handleResponse<{ application: Application; interview: Interview | null; profile: ApplicantProfile | null }>(res);
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, feedback?: string) {
    const res = await fetch(`${API_BASE}/api/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, feedback })
    });
    return handleResponse<Application>(res);
  },

  async bulkUpdateApplicationStatus(applicationIds: string[], status: ApplicationStatus, feedback?: string) {
    const res = await fetch(`${API_BASE}/api/applications/bulk-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationIds, status, feedback })
    });
    return handleResponse<{ success: boolean; updatedCount: number }>(res);
  },

  // Interviews
  async scheduleInterview(data: Partial<Interview> & { applicationId: string; scheduledDate: string; scheduledTime: string }) {
    const res = await fetch(`${API_BASE}/api/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse<Interview>(res);
  },

  async getInterviews(params?: { applicantId?: string; interviewerId?: string; outcome?: string }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.applicantId) query.append("applicantId", params.applicantId);
      if (params.interviewerId) query.append("interviewerId", params.interviewerId);
      if (params.outcome) query.append("outcome", params.outcome);
    }
    const res = await fetch(`${API_BASE}/api/interviews?${query.toString()}`);
    return handleResponse<Interview[]>(res);
  },

  async updateInterviewOutcome(id: string, outcome: InterviewOutcome, notes?: string) {
    const res = await fetch(`${API_BASE}/api/interviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, notes })
    });
    return handleResponse<Interview>(res);
  },

  // Users (Admin)
  async getUsers(role?: string) {
    const query = role ? `?role=${role}` : "";
    const res = await fetch(`${API_BASE}/api/users${query}`);
    return handleResponse<User[]>(res);
  },

  async updateUserStatus(id: string, status: UserStatus) {
    const res = await fetch(`${API_BASE}/api/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return handleResponse<User>(res);
  },

  async updateUserPermission(id: string, permissionLevel: PermissionLevel) {
    const res = await fetch(`${API_BASE}/api/users/${id}/permission`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionLevel })
    });
    return handleResponse<User>(res);
  },

  async deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "DELETE"
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async createHRStaff(data: { name: string; email: string; phone?: string; permissionLevel?: string; department?: string }) {
    const res = await fetch(`${API_BASE}/api/users/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse<User>(res);
  },

  // Notifications
  async getNotifications(userId: string) {
    const res = await fetch(`${API_BASE}/api/notifications?userId=${userId}`);
    return handleResponse<Notification[]>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "PUT"
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async markAllNotificationsRead(userId: string) {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async sendNotification(userIds: string[], title: string, message: string, type?: string) {
    const res = await fetch(`${API_BASE}/api/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds, title, message, type })
    });
    return handleResponse<{ success: boolean; sentCount: number }>(res);
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/api/analytics`);
    return handleResponse<AnalyticsSummary>(res);
  }
};
