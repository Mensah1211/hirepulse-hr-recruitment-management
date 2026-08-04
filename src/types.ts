export type Role = 'admin' | 'applicant';
export type PermissionLevel = 'super_admin' | 'hr_staff' | null;
export type UserStatus = 'active' | 'deactivated';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  permissionLevel?: PermissionLevel;
  department?: string;
  avatarUrl?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ApplicantProfile {
  userId: string;
  title?: string;
  bio?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  coverLetterUrl?: string;
  coverLetterFileName?: string;
  coverLetterUploadedAt?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export type JobStatus = 'draft' | 'published' | 'closed';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type LocationType = 'On-site' | 'Remote' | 'Hybrid';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  department: string;
  location: string;
  locationType: LocationType;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  employmentType: EmploymentType;
  deadline: string;
  status: JobStatus;
  postedByAdminId: string;
  postedByName: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  applicationsCount: number;
}

export type ApplicationStatus = 
  | 'Applied' 
  | 'Under Review' 
  | 'Shortlisted' 
  | 'Interview Scheduled' 
  | 'Rejected' 
  | 'Hired';

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  coverLetterUrl?: string;
  coverLetterFileName?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  feedback?: string;
  // Joined fields for ease
  jobTitle?: string;
  jobDepartment?: string;
  jobLocation?: string;
  jobEmploymentType?: EmploymentType;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantSkills?: string[];
}

export type InterviewMode = 'in_person' | 'virtual';
export type InterviewOutcome = 'Pending' | 'Passed' | 'Failed' | 'Hired';

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  applicantId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  mode: InterviewMode;
  locationOrLink: string;
  interviewerId: string;
  interviewerName: string;
  outcome: InterviewOutcome;
  notes?: string;
  createdAt: string;
  // Joined display attributes
  applicantName?: string;
  applicantEmail?: string;
  jobTitle?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'interview' | 'status_change';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  readStatus: boolean;
  createdAt: string;
  relatedJobId?: string;
  relatedApplicationId?: string;
}

export interface AnalyticsSummary {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  totalApplications: number;
  shortlistingRate: number; // percentage
  hiringRate: number; // percentage
  applicationsByStatus: Record<ApplicationStatus, number>;
  applicationsByDepartment: Record<string, number>;
  monthlyTrends: Array<{ month: string; applications: number; hires: number }>;
}
