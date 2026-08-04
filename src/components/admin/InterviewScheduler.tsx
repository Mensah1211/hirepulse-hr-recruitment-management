import React, { useState, useEffect } from "react";
import { Interview, Application, InterviewOutcome, InterviewMode, User } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../common/StatusBadge";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  X, 
  Edit3 
} from "lucide-react";

interface InterviewSchedulerProps {
  preselectedApp?: Application | null;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ preselectedApp }) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Schedule Form
  const [isModalOpen, setIsModalOpen] = useState(Boolean(preselectedApp));
  const [selectedAppId, setSelectedAppId] = useState(preselectedApp?.id || "");
  const [scheduledDate, setScheduledDate] = useState("2026-08-10");
  const [scheduledTime, setScheduledTime] = useState("14:00");
  const [mode, setMode] = useState<InterviewMode>("virtual");
  const [locationOrLink, setLocationOrLink] = useState("https://meet.google.com/hirepulse-interview");
  const [interviewerId, setInterviewerId] = useState(user?.id || "usr_admin_1");
  const [notes, setNotes] = useState("Technical architecture & behavioral deep-dive.");

  // Outcome update modal
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [outcome, setOutcome] = useState<InterviewOutcome>("Passed");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const ints = await api.getInterviews();
      setInterviews(ints);

      const apps = await api.getApplications();
      setApplications(apps);

      const adminUsers = await api.getUsers("admin");
      setAdmins(adminUsers);

      if (preselectedApp) {
        setSelectedAppId(preselectedApp.id);
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preselectedApp]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    setIsSubmitting(true);
    try {
      await api.scheduleInterview({
        applicationId: selectedAppId,
        scheduledDate,
        scheduledTime,
        mode,
        locationOrLink,
        interviewerId,
        notes
      });

      await fetchData();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterview) return;

    setIsSubmitting(true);
    try {
      await api.updateInterviewOutcome(editingInterview.id, outcome, outcomeNotes);
      setEditingInterview(null);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Interview Scheduler & Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize video or in-person candidate interviews, assign HR interviewers, and record hiring decisions.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAppId(applications[0]?.id || "");
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule New Interview
        </button>
      </div>

      {/* Interviews Grid Cards */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <Clock className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading scheduled interviews...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No interviews scheduled yet</p>
          <p className="text-xs text-slate-500 mt-1">Shortlist candidates in the Applications tab to schedule interviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((intItem) => (
            <div
              key={intItem.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {intItem.jobTitle}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {intItem.applicantName}
                  </h3>
                  <p className="text-xs text-slate-500">{intItem.applicantEmail}</p>
                </div>
                <StatusBadge status={intItem.outcome} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date & Time</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {intItem.scheduledDate} @ {intItem.scheduledTime}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Interviewer</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    {intItem.interviewerName}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <span className="text-slate-400 text-[10px] block">Location / Meeting Link:</span>
                {intItem.mode === "virtual" ? (
                  <a
                    href={intItem.locationOrLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1 truncate"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {intItem.locationOrLink}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {intItem.locationOrLink}
                  </span>
                )}
              </div>

              {intItem.notes && (
                <p className="text-xs text-slate-600 italic">
                  "{intItem.notes}"
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setEditingInterview(intItem);
                    setOutcome(intItem.outcome);
                    setOutcomeNotes(intItem.notes || "");
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Update Outcome
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base">Schedule Candidate Interview</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Shortlisted Candidate</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicantName} - {app.jobTitle} ({app.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interview Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => {
                      const newMode = e.target.value as InterviewMode;
                      setMode(newMode);
                      if (newMode === "virtual") setLocationOrLink("https://meet.google.com/hirepulse-interview");
                      else setLocationOrLink("Main Headquarters, Floor 4, Conference Room B");
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  >
                    <option value="virtual">Virtual Video Call</option>
                    <option value="in_person">In-Person Office</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned HR Interviewer</label>
                  <select
                    value={interviewerId}
                    onChange={(e) => setInterviewerId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  >
                    {admins.map((adm) => (
                      <option key={adm.id} value={adm.id}>{adm.name} ({adm.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Link or Office Location</label>
                <input
                  type="text"
                  required
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interviewer Preparation Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule & Send Invites"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* UPDATE OUTCOME MODAL */}
      {editingInterview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setEditingInterview(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Update Interview Outcome</h3>
              <button onClick={() => setEditingInterview(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleOutcomeSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 font-semibold">
                Candidate: {editingInterview.applicantName} ({editingInterview.jobTitle})
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Interview Decision / Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as InterviewOutcome)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed (Shortlisted for Next Stage)</option>
                  <option value="Hired">Hired! (Extend Job Offer)</option>
                  <option value="Failed">Failed (Reject Candidate)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Evaluation & Technical Feedback Notes</label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Notes on candidate technical skills, soft skills, culture fit..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInterview(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
