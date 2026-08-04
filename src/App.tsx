import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HirePulseLogo } from "./components/common/HirePulseLogo";
import { JobCatalog } from "./components/applicant/JobCatalog";
import { JobDetailModal } from "./components/applicant/JobDetailModal";
import { ApplyModal } from "./components/applicant/ApplyModal";
import { ApplicationTracker } from "./components/applicant/ApplicationTracker";
import { ApplicantProfileEdit } from "./components/applicant/ApplicantProfileEdit";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { JobManagement } from "./components/admin/JobManagement";
import { ApplicationsReview } from "./components/admin/ApplicationsReview";
import { InterviewScheduler } from "./components/admin/InterviewScheduler";
import { UserManagement } from "./components/admin/UserManagement";
import { NotificationBroadcast } from "./components/admin/NotificationBroadcast";
import { Job, Application } from "./types";
import { Briefcase, ArrowRight, ShieldCheck, Heart, Menu } from "lucide-react";

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === "admin";

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>(isAdmin ? "dashboard" : "jobs");

  // Auto-activate dashboard for admin or explore jobs for applicant when user logs in or persona changes
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setActiveTab("dashboard");
      } else {
        setActiveTab("jobs");
      }
    } else {
      setActiveTab("jobs");
    }
  }, [user?.id, user?.role]);

  // Admin Slide Bar state (opens on Menu button click)
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);

  // Job Detail & Apply Modal state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  // Application tracker preselected item
  const [trackerAppId, setTrackerAppId] = useState<string | undefined>(undefined);

  // Interview scheduler preselected item
  const [scheduleForApp, setScheduleForApp] = useState<Application | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* For Admin Users: Slide Bar Layout */}
      {isAdmin ? (
        <div className="flex-1 flex flex-col min-h-screen w-full">
          {/* Top Admin Bar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onNavigateToAppDetail={(appId) => {
              setTrackerAppId(appId);
              setActiveTab("applications_admin");
            }}
            onToggleAdminMobileSidebar={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}
          />

          {/* Admin Slide Bar Drawer (Appears when Menu button clicked) */}
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={isAdminSidebarOpen}
            setIsOpen={setIsAdminSidebarOpen}
          />

          {/* Admin Main Content Portal */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Admin Content View */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
              {activeTab === "dashboard" && (
                <AdminDashboard
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {(activeTab === "jobs_admin" || activeTab === "jobs") && (
                <JobManagement
                  onSelectJobApplications={(jobId) => {
                    setActiveTab("applications_admin");
                  }}
                />
              )}

              {activeTab === "applications_admin" && (
                <ApplicationsReview
                  onScheduleInterviewForApp={(app) => {
                    setScheduleForApp(app);
                    setActiveTab("interviews_admin");
                  }}
                />
              )}

              {activeTab === "interviews_admin" && (
                <InterviewScheduler
                  preselectedApp={scheduleForApp}
                />
              )}

              {activeTab === "users_admin" && (
                <UserManagement />
              )}

              {activeTab === "broadcast_admin" && (
                <NotificationBroadcast />
              )}

              {activeTab === "profile" && (
                <ApplicantProfileEdit />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* For Applicant Users: Standard Full-Width Layout */
        <>
          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onNavigateToAppDetail={(appId) => {
              setTrackerAppId(appId);
              setActiveTab("my_applications");
            }}
          />

          {/* Main Container Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === "jobs" && (
              <JobCatalog
                onSelectJob={(job) => setSelectedJobForDetail(job)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "my_applications" && (
              <ApplicationTracker
                initialSelectedAppId={trackerAppId}
              />
            )}

            {activeTab === "profile" && (
              <ApplicantProfileEdit />
            )}
          </main>
        </>
      )}

      {/* JOB DETAIL MODAL */}
      <JobDetailModal
        job={selectedJobForDetail}
        onClose={() => setSelectedJobForDetail(null)}
        onApply={(job) => {
          setSelectedJobForApply(job);
        }}
      />

      {/* APPLY MODAL */}
      <ApplyModal
        job={selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSuccess={() => {
          setActiveTab("my_applications");
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
