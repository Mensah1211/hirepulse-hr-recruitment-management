import React, { useState, useEffect } from "react";
import { Application, ApplicationStatus, Job } from "../../types";
import { api } from "../../services/api";
import { StatusBadge } from "../common/StatusBadge";
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileDown, 
  ExternalLink, 
  MessageSquare, 
  CheckSquare, 
  Square,
  Clock
} from "lucide-react";

interface ApplicationsReviewProps {
  filterJobId?: string;
  onScheduleInterviewForApp?: (app: Application) => void;
}

export const ApplicationsReview: React.FC<ApplicationsReviewProps> = ({ 
  filterJobId, 
  onScheduleInterviewForApp 
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedJobId, setSelectedJobId] = useState<string>(filterJobId || "All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  // Bulk Selection
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Feedback Modal
  const [feedbackModalApp, setFeedbackModalApp] = useState<Application | null>(null);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>("Shortlisted");
  const [feedbackText, setFeedbackText] = useState("");

  // Inspect Candidate Drawer
  const [inspectingApp, setInspectingApp] = useState<Application | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const apps = await api.getApplications({
        jobId: selectedJobId !== "All" ? selectedJobId : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        search: search || undefined
      });
      setApplications(apps);

      const allJobs = await api.getJobs();
      setJobs(allJobs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJobId, statusFilter, search]);

  const handleSelectAll = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map(a => a.id));
    }
  };

  const handleToggleSelectApp = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter(i => i !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  const handleSingleStatusUpdate = async (app: Application, newStatus: ApplicationStatus) => {
    setFeedbackModalApp(app);
    setTargetStatus(newStatus);
    setFeedbackText(
      newStatus === "Shortlisted"
        ? "Congratulations! Your profile has been shortlisted by our HR team. We will contact you soon for interview scheduling."
        : newStatus === "Rejected"
        ? "Thank you for applying to HirePulse. At this time, we have chosen to proceed with candidates whose skills more closely align with our current role requirements."
        : ""
    );
  };

  const handleConfirmStatusChange = async () => {
    if (!feedbackModalApp) return;
    try {
      await api.updateApplicationStatus(feedbackModalApp.id, targetStatus, feedbackText);
      setFeedbackModalApp(null);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkStatusChange = async (newStatus: ApplicationStatus) => {
    if (selectedAppIds.length === 0) return;
    if (confirm(`Apply status "${newStatus}" to ${selectedAppIds.length} selected candidate applications?`)) {
      await api.bulkUpdateApplicationStatus(selectedAppIds, newStatus);
      setSelectedAppIds([]);
      await fetchData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Applicant Applications Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluate candidate profiles, review resumes, shortlist talent, and issue status updates.
          </p>
        </div>

        {/* Bulk Action Buttons */}
        {selectedAppIds.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-200 rounded-xl animate-in fade-in">
            <span className="text-xs font-bold text-indigo-900 px-2">
              {selectedAppIds.length} Selected
            </span>
            <button
              onClick={() => handleBulkStatusChange("Shortlisted")}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bulk Shortlist
            </button>
            <button
              onClick={() => handleBulkStatusChange("Rejected")}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Bulk Reject
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, email, skills..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Job Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="p-2 text-xs border border-slate-300 rounded-xl max-w-xs focus:outline-none"
            >
              <option value="All">All Job Postings</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
            >
              <option value="All">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <Clock className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading candidate submissions...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No candidate applications found</p>
          <p className="text-xs text-slate-500 mt-1">Adjust your search query or filter settings.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-slate-500 hover:text-slate-800">
                      {selectedAppIds.length === applications.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Candidate Name</th>
                  <th className="px-4 py-3.5">Job Applied For</th>
                  <th className="px-4 py-3.5">Current Stage</th>
                  <th className="px-4 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5 text-right">Shortlist / Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map((app) => {
                  const isSelected = selectedAppIds.includes(app.id);
                  return (
                    <tr key={app.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggleSelectApp(app.id)} className="text-slate-400 hover:text-indigo-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                            {app.applicantName ? app.applicantName.charAt(0) : "A"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{app.applicantName}</p>
                            <p className="text-[11px] text-slate-500">{app.applicantEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800">{app.jobTitle}</p>
                        <p className="text-[10px] text-slate-500">{app.jobDepartment}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingApp(app)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Inspect
                          </button>

                          {app.status !== "Shortlisted" && app.status !== "Interview Scheduled" && app.status !== "Hired" && (
                            <button
                              onClick={() => handleSingleStatusUpdate(app, "Shortlisted")}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              Shortlist
                            </button>
                          )}

                          {(app.status === "Shortlisted" || app.status === "Interview Scheduled") && onScheduleInterviewForApp && (
                            <button
                              onClick={() => onScheduleInterviewForApp(app)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Schedule Interview
                            </button>
                          )}

                          {app.status !== "Rejected" && (
                            <button
                              onClick={() => handleSingleStatusUpdate(app, "Rejected")}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEEDBACK & STATUS CHANGE DIALOG */}
      {feedbackModalApp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setFeedbackModalApp(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Update Status to: <span className="text-amber-400">{targetStatus}</span>
              </h3>
              <button onClick={() => setFeedbackModalApp(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700">
                Updating application status for <strong>{feedbackModalApp.applicantName}</strong> ({feedbackModalApp.jobTitle}).
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Candidate Notification Note / Email Feedback:
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setFeedbackModalApp(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT CANDIDATE MODAL DRAWER */}
      {inspectingApp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setInspectingApp(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-400">Candidate Submission Detail</p>
                <h3 className="font-extrabold text-base">{inspectingApp.applicantName}</h3>
              </div>
              <button onClick={() => setInspectingApp(null)} className="p-1.5 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Email:</span> <strong className="text-slate-900">{inspectingApp.applicantEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span> <strong className="text-slate-900">{inspectingApp.applicantPhone || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Applied Job:</span> <strong className="text-slate-900">{inspectingApp.jobTitle}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Applied Date:</span> <strong className="text-slate-900">{new Date(inspectingApp.appliedAt).toLocaleDateString()}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Cover Letter Document</h4>
                <a
                  href={inspectingApp.coverLetterUrl || inspectingApp.resumeUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    {inspectingApp.coverLetterFileName || "View Cover Letter Document"}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Resume / CV Document</h4>
                <a
                  href={inspectingApp.resumeUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    {inspectingApp.resumeFileName || "Download Resume"}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectingApp(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
