import React, { useState } from "react";
import { Job } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { X, Send, FileText, Upload, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from "lucide-react";

interface ApplyModalProps {
  job: Job | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const { user, profile } = useAuth();

  const [resumeFileName, setResumeFileName] = useState(profile?.resumeFileName || "");
  const [resumeBase64, setResumeBase64] = useState("");
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || "");

  const [coverLetterFileName, setCoverLetterFileName] = useState(profile?.coverLetterFileName || "");
  const [coverLetterBase64, setCoverLetterBase64] = useState("");
  const [coverLetterUrl, setCoverLetterUrl] = useState(profile?.coverLetterUrl || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!job || !user) return null;

  const hasSavedResume = Boolean(profile?.resumeFileName || profile?.resumeUrl);
  const hasSavedCoverLetter = Boolean(profile?.coverLetterFileName || profile?.coverLetterUrl);
  const hasSavedProfileDocs = hasSavedResume || hasSavedCoverLetter;

  const handleUseSavedResume = () => {
    if (hasSavedResume) {
      setResumeFileName(profile?.resumeFileName || "Saved_Profile_Resume.pdf");
      setResumeUrl(profile?.resumeUrl || "");
      setResumeBase64("");
      setError(null);
    }
  };

  const handleUseSavedCoverLetter = () => {
    if (hasSavedCoverLetter) {
      setCoverLetterFileName(profile?.coverLetterFileName || "Saved_Profile_Cover_Letter.pdf");
      setCoverLetterUrl(profile?.coverLetterUrl || "");
      setCoverLetterBase64("");
      setError(null);
    }
  };

  const handleUseSavedAll = () => {
    if (hasSavedResume) handleUseSavedResume();
    if (hasSavedCoverLetter) handleUseSavedCoverLetter();
  };

  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Invalid file type. Only PDF documents (.pdf) are allowed for CV / Resume.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Resume PDF file size exceeds the 10MB limit.");
      e.target.value = "";
      return;
    }

    setError(null);
    setResumeFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setResumeBase64(base64);
      setResumeUrl(`data:application/pdf;base64,${base64}`);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverLetterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Invalid file type. Only PDF documents (.pdf) are allowed for Cover Letter.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Cover letter PDF file size exceeds the 10MB limit.");
      e.target.value = "";
      return;
    }

    setError(null);
    setCoverLetterFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setCoverLetterBase64(base64);
      setCoverLetterUrl(`data:application/pdf;base64,${base64}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!resumeFileName && !resumeUrl) {
      setError("Please upload or select your CV / Resume PDF.");
      setIsSubmitting(false);
      return;
    }

    if (!coverLetterFileName && !coverLetterUrl) {
      setError("Please upload or select your Cover Letter PDF.");
      setIsSubmitting(false);
      return;
    }

    try {
      const finalResumeFileName = resumeFileName || "Applicant_Resume.pdf";
      const finalResumeUrl = resumeUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

      const finalCoverLetterFileName = coverLetterFileName || "Applicant_Cover_Letter.pdf";
      const finalCoverLetterUrl = coverLetterUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

      await api.applyToJob({
        jobId: job.id,
        applicantId: user.id,
        resumeUrl: finalResumeUrl,
        resumeFileName: finalResumeFileName,
        coverLetterUrl: finalCoverLetterUrl,
        coverLetterFileName: finalCoverLetterFileName
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">Application Submission</span>
            <h2 className="text-base sm:text-lg font-bold text-white">{job.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs sm:text-sm overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          {/* Quick Auto-Fill Banner for Saved Documents */}
          {hasSavedProfileDocs && (
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-indigo-950 font-semibold text-xs">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Saved Profile Documents Available</p>
                  <p className="text-[11px] text-slate-500">Auto-fill your stored PDF Resume & Cover Letter from your applicant profile.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseSavedAll}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Use Saved Documents
              </button>
            </div>
          )}

          {/* Applicant Info Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 text-xs">Applicant Details:</p>
              <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
                Job Application
              </span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-slate-500 text-xs">{user.email} • {user.phone}</p>
              </div>
            </div>
          </div>

          {/* PDF Resume/CV Upload */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                CV / Resume (PDF Format Only) <span className="text-rose-500">*</span>
              </label>

              {hasSavedResume && (
                <button
                  type="button"
                  onClick={handleUseSavedResume}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Use Saved Profile CV
                </button>
              )}
            </div>

            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
              {resumeFileName ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-xs truncate">{resumeFileName}</span>
                  </div>
                  <label className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer shrink-0 ml-2">
                    Change PDF
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleResumeFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-50/80 transition-colors">
                  <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                  <span className="font-bold text-slate-700 text-xs">Click to upload CV / Resume (PDF Only)</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PDF documents up to 10MB</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleResumeFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* PDF Cover Letter Upload */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Cover Letter (PDF Format Only) <span className="text-rose-500">*</span>
              </label>

              {hasSavedCoverLetter && (
                <button
                  type="button"
                  onClick={handleUseSavedCoverLetter}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Use Saved Profile Cover Letter
                </button>
              )}
            </div>

            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
              {coverLetterFileName ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-xs truncate">{coverLetterFileName}</span>
                  </div>
                  <label className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer shrink-0 ml-2">
                    Change PDF
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleCoverLetterFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50/80 transition-colors">
                  <Upload className="w-6 h-6 text-amber-600 mb-1" />
                  <span className="font-bold text-slate-700 text-xs">Click to upload Cover Letter (PDF Only)</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PDF documents up to 10MB</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleCoverLetterFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


