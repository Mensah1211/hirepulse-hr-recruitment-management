import React, { useState, useEffect } from "react";
import { Application, Interview, ApplicationStatus } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../common/StatusBadge";
import { CheckCircle2, Clock, Calendar, MapPin, Video, FileText, ChevronRight, AlertCircle, Building2, ExternalLink } from "lucide-react";

interface ApplicationTrackerProps {
  initialSelectedAppId?: string;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ initialSelectedAppId }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(initialSelectedAppId || null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const apps = await api.getApplications({ applicantId: user.id });
      setApplications(apps);
      
      const ints = await api.getInterviews({ applicantId: user.id });
      setInterviews(ints);

      if (apps.length > 0 && !selectedAppId) {
        setSelectedAppId(apps[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];
  const selectedInterview = selectedApp ? interviews.find(i => i.applicationId === selectedApp.id) : null;

  // Stages for the visual timeline stepper
  const stages: ApplicationStatus[] = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Hired"
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    if (status === "Rejected") return -1;
    return stages.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Application Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your job applications, view stage progress timelapses, and check scheduled interview details.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <Clock className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore available job postings in the catalog and apply with 1-click using your saved profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Applications List Sidebar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 h-fit">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 px-2">
              Submitted Roles ({applications.length})
            </h3>
            <div className="space-y-2">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedApp?.id === app.id
                      ? "border-indigo-600 bg-indigo-50/70 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{app.jobTitle}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {app.jobDepartment}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform shrink-0 mt-1 ${selectedApp?.id === app.id ? "text-indigo-600 translate-x-0.5" : "text-slate-300"}`} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <StatusBadge status={app.status} size="sm" />
                    <span className="text-[10px] text-slate-400">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Application Detail & Timeline Stepper */}
          {selectedApp && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Application Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {selectedApp.jobDepartment}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                      {selectedApp.jobTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied on {new Date(selectedApp.appliedAt).toLocaleDateString()} • Application ID: {selectedApp.id}
                    </p>
                  </div>
                  <StatusBadge status={selectedApp.status} size="lg" />
                </div>

                {/* VISUAL TIMELINE STEPPER */}
                <div className="pt-2">
                  <h4 className="font-bold text-slate-900 text-xs mb-4">Application Progress Tracker</h4>

                  {selectedApp.status === "Rejected" ? (
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-900 text-xs">Application Not Selected</p>
                        <p className="text-xs text-rose-700 mt-0.5">
                          Thank you for taking the time to apply. HR has decided to proceed with other candidates at this time.
                        </p>
                        {selectedApp.feedback && (
                          <div className="mt-2 p-2.5 bg-white rounded-lg border border-rose-200 text-xs text-slate-700">
                            <strong>HR Feedback:</strong> "{selectedApp.feedback}"
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center justify-between relative z-10">
                        {stages.map((stage, idx) => {
                          const currentIdx = getStageIndex(selectedApp.status);
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div key={stage} className="flex flex-col items-center flex-1 text-center group">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isDone
                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                    : "bg-slate-100 text-slate-400 border border-slate-300"
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs font-medium mt-2 leading-tight ${
                                  isCurrent
                                    ? "text-indigo-700 font-bold"
                                    : isDone
                                    ? "text-slate-800"
                                    : "text-slate-400"
                                }`}
                              >
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                    </div>
                  )}
                </div>

                {/* HR Feedback Note */}
                {selectedApp.feedback && selectedApp.status !== "Rejected" && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <p className="font-bold mb-0.5">Note from HR Administrator:</p>
                    <p className="italic">"{selectedApp.feedback}"</p>
                  </div>
                )}
              </div>

              {/* Scheduled Interview Card */}
              {selectedInterview && (
                <div className="bg-gradient-to-tr from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                      <Calendar className="w-4 h-4" />
                      Interview Scheduled
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      Status: {selectedInterview.outcome}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <p className="text-indigo-200 text-[11px]">Date & Time</p>
                      <p className="font-bold text-white text-sm">
                        {new Date(selectedInterview.scheduledDate).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at {selectedInterview.scheduledTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-[11px]">Mode & Format</p>
                      <p className="font-semibold text-white capitalize flex items-center gap-1">
                        {selectedInterview.mode === "virtual" ? <Video className="w-3.5 h-3.5 text-emerald-300" /> : <MapPin className="w-3.5 h-3.5 text-amber-300" />}
                        {selectedInterview.mode === "virtual" ? "Virtual Video Call" : "In-Person Office"}
                      </p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-[11px]">Interviewer</p>
                      <p className="font-semibold text-white">{selectedInterview.interviewerName} (HR)</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-[11px]">Location / Access Link</p>
                      {selectedInterview.mode === "virtual" ? (
                        <a
                          href={selectedInterview.locationOrLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-300 hover:underline flex items-center gap-1 truncate"
                        >
                          Join Meeting <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="font-semibold text-white truncate">{selectedInterview.locationOrLink}</p>
                      )}
                    </div>
                  </div>

                  {selectedInterview.notes && (
                    <div className="mt-2 pt-2 border-t border-indigo-700/60 text-xs text-indigo-100">
                      <strong className="text-amber-200">Interviewer Notes:</strong> {selectedInterview.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Attached PDF Documents */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Attached Application Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={selectedApp.resumeUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl border border-indigo-100 flex items-center justify-between text-indigo-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-xs">CV / Resume Document</p>
                        <p className="text-[11px] text-indigo-600/80 truncate">{selectedApp.resumeFileName || "Resume.pdf"}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                  </a>

                  <a
                    href={selectedApp.coverLetterUrl || selectedApp.resumeUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-amber-50 hover:bg-amber-100/80 rounded-xl border border-amber-100 flex items-center justify-between text-amber-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-xs">Cover Letter Document</p>
                        <p className="text-[11px] text-amber-600/80 truncate">{selectedApp.coverLetterFileName || "Cover_Letter.pdf"}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-amber-600 shrink-0 ml-2" />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
