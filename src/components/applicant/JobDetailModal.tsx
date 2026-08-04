import React from "react";
import { Job } from "../../types";
import { X, Building2, MapPin, DollarSign, Calendar, CheckCircle2, Send, Share2, Briefcase } from "lucide-react";

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onApply: (job: Job) => void;
  hasApplied?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onApply, hasApplied = false }) => {
  if (!job) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {job.department}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                {job.employmentType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                {job.locationType}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
          
          {/* Company & Posting Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                HP
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">HirePulse Talent Team</p>
                <p className="text-xs text-slate-500">Posted by {job.postedByName} • {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Job posting link copied to clipboard!");
              }}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Job Overview
            </h3>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed bg-white p-1">
              {job.description}
            </p>
          </div>

          {/* Requirements Checklist */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Requirements & Qualifications
            </h3>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 text-xs sm:text-sm font-medium">{req}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="hidden sm:block text-xs text-slate-500">
            {job.applicationsCount} candidate{job.applicationsCount !== 1 ? "s" : ""} have applied
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Close
            </button>

            {hasApplied ? (
              <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Application Submitted
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApply(job);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Apply for this Position
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
