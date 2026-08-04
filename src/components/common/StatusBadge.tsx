import React from "react";
import { ApplicationStatus, JobStatus, InterviewOutcome } from "../../types";

interface StatusBadgeProps {
  status: ApplicationStatus | JobStatus | InterviewOutcome | string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    // Application statuses
    case "Applied":
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "Under Review":
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case "Shortlisted":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-300 font-semibold";
      break;
    case "Interview Scheduled":
      colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold";
      break;
    case "Hired":
    case "Passed":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold";
      break;
    case "Rejected":
    case "Failed":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
      break;

    // Job statuses
    case "published":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "draft":
      colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
      break;
    case "closed":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      break;

    default:
      colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm font-medium"
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${colorClasses} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
