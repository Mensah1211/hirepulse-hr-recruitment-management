import os

content = """import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

import { 
  User, 
  ApplicantProfile, 
  Job, 
  Application, 
  Interview, 
  Notification, 
  AnalyticsSummary, 
  ApplicationStatus 
} from "./src/types.js";

const PORT = 3000;

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper helper to generate IDs
const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// --- SERVER SETUP ---
async function startServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const { data: user, error } = await supabase.from('users').select('*').ilike('email', email).single();
    
    if (error || !user) return res.status(401).json({ error: "Invalid email or user not found" });
    if (user.status === "deactivated") return res.status(403).json({ error: "Your account has been deactivated by HR administrator." });

    const { data: profile } = await supabase.from('applicant_profiles').select('*').eq('user_id', user.id).single();
    
    const token = `token_${user.id}_${Date.now()}`;
    
    // map snake_case to camelCase
    const formattedUser = {
      ...user,
      permissionLevel: user.permission_level,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    };
    
    const formattedProfile = profile ? {
      ...profile,
      userId: profile.user_id,
      resumeUrl: profile.resume_url,
      resumeFileName: profile.resume_file_name,
      resumeUploadedAt: profile.resume_uploaded_at,
      coverLetterUrl: profile.cover_letter_url,
      coverLetterFileName: profile.cover_letter_file_name,
      coverLetterUploadedAt: profile.cover_letter_uploaded_at,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      portfolioUrl: profile.portfolio_url
    } : null;

    res.json({ token, user: formattedUser, profile: formattedProfile });
  });

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, role, permissionLevel, department, avatarUrl } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and Email are required" });

    const { data: existing } = await supabase.from('users').select('id').ilike('email', email).single();
    if (existing) return res.status(400).json({ error: "An account with this email already exists" });

    const newUser = {
      id: genId("usr"),
      name,
      email,
      phone: phone || "",
      role: role || "applicant",
      status: "active",
      permission_level: role === "admin" ? (permissionLevel || "hr_staff") : null,
      department: role === "admin" ? (department || "Human Resources") : null,
      avatar_url: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`
    };

    const { error: insertError } = await supabase.from('users').insert(newUser);
    if (insertError) return res.status(500).json({ error: insertError.message });

    let profile = null;
    let formattedProfile = null;
    if (newUser.role === "applicant") {
      profile = { user_id: newUser.id, skills: [], education: [], experience: [] };
      await supabase.from('applicant_profiles').insert(profile);
      formattedProfile = { ...profile, userId: profile.user_id };
    }

    const token = `token_${newUser.id}_${Date.now()}`;
    
    const formattedUser = {
      ...newUser,
      permissionLevel: newUser.permission_level,
      avatarUrl: newUser.avatar_url
    };
    
    res.status(201).json({ token, user: formattedUser, profile: formattedProfile });
  });

  // Auth: Password Reset Simulation
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const { data: user } = await supabase.from('users').select('id').ilike('email', email).single();
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    
    res.json({ message: `Password reset link sent to ${email}` });
  });

  // Profile: Get Profile
  app.get("/api/profile/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error || !user) return res.status(404).json({ error: "User not found" });

    const { data: profile } = await supabase.from('applicant_profiles').select('*').eq('user_id', userId).single();
    
    const formattedUser = {
      ...user,
      permissionLevel: user.permission_level,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    };
    
    const formattedProfile = profile ? {
      ...profile,
      userId: profile.user_id,
      resumeUrl: profile.resume_url,
      resumeFileName: profile.resume_file_name,
      resumeUploadedAt: profile.resume_uploaded_at,
      coverLetterUrl: profile.cover_letter_url,
      coverLetterFileName: profile.cover_letter_file_name,
      coverLetterUploadedAt: profile.cover_letter_uploaded_at,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      portfolioUrl: profile.portfolio_url
    } : { userId: userId, skills: [], education: [], experience: [] };
    
    res.json({ user: formattedUser, profile: formattedProfile });
  });

  // Profile: Update Profile
  app.put("/api/profile", async (req, res) => {
    const { userId, name, phone, title, bio, skills, education, experience, linkedinUrl, githubUrl, portfolioUrl, avatarUrl } = req.body;

    const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error || !user) return res.status(404).json({ error: "User not found" });

    const userUpdates: any = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.phone = phone;
    if (avatarUrl) userUpdates.avatar_url = avatarUrl;
    
    if (Object.keys(userUpdates).length > 0) {
      await supabase.from('users').update(userUpdates).eq('id', userId);
    }

    const { data: currentProfile } = await supabase.from('applicant_profiles').select('*').eq('user_id', userId).single();
    
    const profileUpdates: any = {
      title: title !== undefined ? title : currentProfile?.title,
      bio: bio !== undefined ? bio : currentProfile?.bio,
      skills: Array.isArray(skills) ? skills : currentProfile?.skills || [],
      education: Array.isArray(education) ? education : currentProfile?.education || [],
      experience: Array.isArray(experience) ? experience : currentProfile?.experience || [],
      linkedin_url: linkedinUrl !== undefined ? linkedinUrl : currentProfile?.linkedin_url,
      github_url: githubUrl !== undefined ? githubUrl : currentProfile?.github_url,
      portfolio_url: portfolioUrl !== undefined ? portfolioUrl : currentProfile?.portfolio_url,
    };

    if (!currentProfile) {
      profileUpdates.user_id = userId;
      await supabase.from('applicant_profiles').insert(profileUpdates);
    } else {
      await supabase.from('applicant_profiles').update(profileUpdates).eq('user_id', userId);
    }

    const { data: updatedUser } = await supabase.from('users').select('*').eq('id', userId).single();
    const { data: updatedProfile } = await supabase.from('applicant_profiles').select('*').eq('user_id', userId).single();

    res.json({ 
      user: {
        ...updatedUser,
        permissionLevel: updatedUser.permission_level,
        avatarUrl: updatedUser.avatar_url,
        createdAt: updatedUser.created_at
      }, 
      profile: {
        ...updatedProfile,
        userId: updatedProfile.user_id,
        resumeUrl: updatedProfile.resume_url,
        resumeFileName: updatedProfile.resume_file_name,
        resumeUploadedAt: updatedProfile.resume_uploaded_at,
        coverLetterUrl: updatedProfile.cover_letter_url,
        coverLetterFileName: updatedProfile.cover_letter_file_name,
        coverLetterUploadedAt: updatedProfile.cover_letter_uploaded_at,
        linkedinUrl: updatedProfile.linkedin_url,
        githubUrl: updatedProfile.github_url,
        portfolioUrl: updatedProfile.portfolio_url
      } 
    });
  });

  // Profile: Upload Resume
  app.post("/api/profile/resume", async (req, res) => {
    const { userId, fileName, fileContentBase64 } = req.body;
    if (!userId || !fileName) return res.status(400).json({ error: "UserId and fileName are required" });

    const mockResumeUrl = fileContentBase64 ? `data:application/pdf;base64,${fileContentBase64}` : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const uploadedAt = new Date().toISOString();

    const { data: existing } = await supabase.from('applicant_profiles').select('user_id').eq('user_id', userId).single();
    if (existing) {
        await supabase.from('applicant_profiles').update({ resume_url: mockResumeUrl, resume_file_name: fileName, resume_uploaded_at: uploadedAt }).eq('user_id', userId);
    } else {
        await supabase.from('applicant_profiles').insert({ user_id: userId, resume_url: mockResumeUrl, resume_file_name: fileName, resume_uploaded_at: uploadedAt });
    }

    res.json({ success: true, resumeUrl: mockResumeUrl, resumeFileName: fileName, resumeUploadedAt: uploadedAt });
  });

  // Profile: Upload Cover Letter
  app.post("/api/profile/cover-letter", async (req, res) => {
    const { userId, fileName, fileContentBase64 } = req.body;
    if (!userId || !fileName) return res.status(400).json({ error: "UserId and fileName are required" });

    const mockCoverLetterUrl = fileContentBase64 ? `data:application/pdf;base64,${fileContentBase64}` : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const uploadedAt = new Date().toISOString();

    const { data: existing } = await supabase.from('applicant_profiles').select('user_id').eq('user_id', userId).single();
    if (existing) {
        await supabase.from('applicant_profiles').update({ cover_letter_url: mockCoverLetterUrl, cover_letter_file_name: fileName, cover_letter_uploaded_at: uploadedAt }).eq('user_id', userId);
    } else {
        await supabase.from('applicant_profiles').insert({ user_id: userId, cover_letter_url: mockCoverLetterUrl, cover_letter_file_name: fileName, cover_letter_uploaded_at: uploadedAt });
    }

    res.json({ success: true, coverLetterUrl: mockCoverLetterUrl, coverLetterFileName: fileName, coverLetterUploadedAt: uploadedAt });
  });

  // Jobs: List Jobs
  app.get("/api/jobs", async (req, res) => {
    const { search, department, locationType, employmentType, status, salaryMin } = req.query;

    let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (department && department !== "All") query = query.eq('department', department);
    if (locationType && locationType !== "All") query = query.eq('location_type', locationType);
    if (employmentType && employmentType !== "All") query = query.eq('employment_type', employmentType);
    if (salaryMin) {
      const minVal = Number(salaryMin);
      if (!isNaN(minVal) && minVal > 0) query = query.gte('salary_max', minVal);
    }

    const { data: result, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    let finalResult = result || [];
    if (search) {
      const q = (search as string).toLowerCase();
      finalResult = finalResult.filter(j => 
        (j.title && j.title.toLowerCase().includes(q)) || 
        (j.description && j.description.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q))
      );
    }

    // Convert snake_case to camelCase roughly for frontend compatibility
    const formattedResult = finalResult.map(j => ({
      ...j,
      locationType: j.location_type,
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      salaryCurrency: j.salary_currency,
      employmentType: j.employment_type,
      postedByAdminId: j.posted_by_admin_id,
      postedByName: j.posted_by_name,
      viewCount: j.view_count,
      applicationsCount: j.applications_count,
      createdAt: j.created_at,
      updatedAt: j.updated_at
    }));

    res.json(formattedResult);
  });

  // Jobs: Get Job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    const { data: job, error } = await supabase.from('jobs').select('*').eq('id', req.params.id).single();
    if (error || !job) return res.status(404).json({ error: "Job posting not found" });

    // Increment view count
    await supabase.from('jobs').update({ view_count: (job.view_count || 0) + 1 }).eq('id', job.id);
    job.view_count = (job.view_count || 0) + 1;

    res.json({
      ...job,
      locationType: job.location_type,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: job.salary_currency,
      employmentType: job.employment_type,
      postedByAdminId: job.posted_by_admin_id,
      postedByName: job.posted_by_name,
      viewCount: job.view_count,
      applicationsCount: job.applications_count,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    });
  });

  // Jobs: Create Job (Admin)
  app.post("/api/jobs", async (req, res) => {
    const { title, description, requirements, department, location, locationType, salaryMin, salaryMax, salaryCurrency, employmentType, deadline, status, postedByAdminId } = req.body;

    if (!title || !description || !department) return res.status(400).json({ error: "Title, description, and department are required" });

    const { data: admin } = await supabase.from('users').select('*').eq('id', postedByAdminId).single();

    const newJob = {
      id: genId("job"),
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      department,
      location: location || "Remote",
      location_type: locationType || "Remote",
      salary_min: Number(salaryMin) || 0,
      salary_max: Number(salaryMax) || 0,
      salary_currency: salaryCurrency || "USD",
      employment_type: employmentType || "Full-time",
      deadline: deadline || "2026-12-31",
      status: status || "published",
      posted_by_admin_id: admin?.id || null,
      posted_by_name: admin?.name || "Admin",
      view_count: 0,
      applications_count: 0
    };

    const { error } = await supabase.from('jobs').insert(newJob);
    if (error) return res.status(500).json({ error: error.message });
    
    const { data: createdJob } = await supabase.from('jobs').select('*').eq('id', newJob.id).single();

    res.status(201).json({
      ...createdJob,
      locationType: createdJob.location_type,
      salaryMin: createdJob.salary_min,
      salaryMax: createdJob.salary_max,
      salaryCurrency: createdJob.salary_currency,
      employmentType: createdJob.employment_type,
      postedByAdminId: createdJob.posted_by_admin_id,
      postedByName: createdJob.posted_by_name,
      viewCount: createdJob.view_count,
      applicationsCount: createdJob.applications_count,
      createdAt: createdJob.created_at,
      updatedAt: createdJob.updated_at
    });
  });

  // Jobs: Update Job
  app.put("/api/jobs/:id", async (req, res) => {
    const jobId = req.params.id;
    const { title, description, requirements, department, location, locationType, salaryMin, salaryMax, salaryCurrency, employmentType, deadline, status } = req.body;
    
    const updates: any = { updated_at: new Date().toISOString() };
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (requirements) updates.requirements = requirements;
    if (department) updates.department = department;
    if (location) updates.location = location;
    if (locationType) updates.location_type = locationType;
    if (salaryMin !== undefined) updates.salary_min = salaryMin;
    if (salaryMax !== undefined) updates.salary_max = salaryMax;
    if (salaryCurrency) updates.salary_currency = salaryCurrency;
    if (employmentType) updates.employment_type = employmentType;
    if (deadline) updates.deadline = deadline;
    if (status) updates.status = status;

    const { error } = await supabase.from('jobs').update(updates).eq('id', jobId);
    if (error) return res.status(500).json({ error: error.message });

    const { data: updated } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (!updated) return res.status(404).json({ error: "Job not found" });

    res.json({
      ...updated,
      locationType: updated.location_type,
      salaryMin: updated.salary_min,
      salaryMax: updated.salary_max,
      salaryCurrency: updated.salary_currency,
      employmentType: updated.employment_type,
      postedByAdminId: updated.posted_by_admin_id,
      postedByName: updated.posted_by_name,
      viewCount: updated.view_count,
      applicationsCount: updated.applications_count,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    });
  });

  // Jobs: Delete Job
  app.delete("/api/jobs/:id", async (req, res) => {
    await supabase.from('jobs').delete().eq('id', req.params.id);
    res.json({ success: true, message: "Job deleted successfully" });
  });

  // Applications: Submit
  app.post("/api/applications", async (req, res) => {
    const { jobId, applicantId, coverLetter, resumeUrl, resumeFileName, coverLetterUrl, coverLetterFileName } = req.body;
    if (!jobId || !applicantId) return res.status(400).json({ error: "jobId and applicantId are required" });

    const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    const { data: applicant } = await supabase.from('users').select('*').eq('id', applicantId).single();
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!applicant) return res.status(404).json({ error: "Applicant not found" });

    const { data: existing } = await supabase.from('applications').select('id').eq('job_id', jobId).eq('applicant_id', applicantId).single();
    if (existing) return res.status(400).json({ error: "You have already applied for this job posting" });

    const { data: profile } = await supabase.from('applicant_profiles').select('*').eq('user_id', applicantId).single();

    const newApp = {
      id: genId("app"),
      job_id: jobId,
      applicant_id: applicantId,
      cover_letter: coverLetter || "",
      cover_letter_url: coverLetterUrl || profile?.cover_letter_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      cover_letter_file_name: coverLetterFileName || profile?.cover_letter_file_name || "Applicant_Cover_Letter.pdf",
      resume_url: resumeUrl || profile?.resume_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      resume_file_name: resumeFileName || profile?.resume_file_name || "Applicant_Resume.pdf",
      status: "Under Review",
      job_title: job.title,
      job_department: job.department,
      job_location: job.location,
      job_employment_type: job.employment_type,
      applicant_name: applicant.name,
      applicant_email: applicant.email,
      applicant_phone: applicant.phone,
      applicant_skills: profile?.skills || []
    };

    const { error } = await supabase.from('applications').insert(newApp);
    if (error) return res.status(500).json({ error: error.message });

    await supabase.from('jobs').update({ applications_count: (job.applications_count || 0) + 1 }).eq('id', jobId);

    await supabase.from('notifications').insert({
      id: genId("notif"),
      user_id: applicantId,
      title: "Application Received",
      message: `Your application for "${job.title}" has been received and is now Under Review.`,
      type: "info",
      related_job_id: jobId,
      related_application_id: newApp.id
    });

    const { data: hrUsers } = await supabase.from('users').select('id').eq('role', 'admin');
    if (hrUsers) {
      for (const hr of hrUsers) {
        await supabase.from('notifications').insert({
          id: genId("notif"),
          user_id: hr.id,
          title: "New Job Application Received",
          message: `Candidate ${applicant.name} has submitted a new application for "${job.title}".`,
          type: "info",
          related_job_id: jobId,
          related_application_id: newApp.id
        });
      }
    }

    const { data: createdApp } = await supabase.from('applications').select('*').eq('id', newApp.id).single();
    res.status(201).json({
      ...createdApp,
      jobId: createdApp.job_id,
      applicantId: createdApp.applicant_id,
      coverLetter: createdApp.cover_letter,
      coverLetterUrl: createdApp.cover_letter_url,
      coverLetterFileName: createdApp.cover_letter_file_name,
      resumeUrl: createdApp.resume_url,
      resumeFileName: createdApp.resume_file_name,
      jobTitle: createdApp.job_title,
      jobDepartment: createdApp.job_department,
      jobLocation: createdApp.job_location,
      jobEmploymentType: createdApp.job_employment_type,
      applicantName: createdApp.applicant_name,
      applicantEmail: createdApp.applicant_email,
      applicantPhone: createdApp.applicant_phone,
      applicantSkills: createdApp.applicant_skills,
      appliedAt: createdApp.applied_at,
      updatedAt: createdApp.updated_at
    });
  });

  // Applications: List
  app.get("/api/applications", async (req, res) => {
    const { jobId, applicantId, status, search } = req.query;

    let query = supabase.from('applications').select('*').order('applied_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);
    if (applicantId) query = query.eq('applicant_id', applicantId);
    if (status && status !== "All") query = query.eq('status', status);

    const { data: result, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    let finalResult = result || [];
    if (search) {
      const q = (search as string).toLowerCase();
      finalResult = finalResult.filter(a => 
        (a.applicant_name && a.applicant_name.toLowerCase().includes(q)) ||
        (a.applicant_email && a.applicant_email.toLowerCase().includes(q)) ||
        (a.job_title && a.job_title.toLowerCase().includes(q))
      );
    }

    const formattedResult = finalResult.map(a => ({
      ...a,
      jobId: a.job_id,
      applicantId: a.applicant_id,
      coverLetter: a.cover_letter,
      coverLetterUrl: a.cover_letter_url,
      coverLetterFileName: a.cover_letter_file_name,
      resumeUrl: a.resume_url,
      resumeFileName: a.resume_file_name,
      jobTitle: a.job_title,
      jobDepartment: a.job_department,
      jobLocation: a.job_location,
      jobEmploymentType: a.job_employment_type,
      applicantName: a.applicant_name,
      applicantEmail: a.applicant_email,
      applicantPhone: a.applicant_phone,
      applicantSkills: a.applicant_skills,
      appliedAt: a.applied_at,
      updatedAt: a.updated_at
    }));

    res.json(formattedResult);
  });

  // Applications: Get Single
  app.get("/api/applications/:id", async (req, res) => {
    const { data: appItem, error } = await supabase.from('applications').select('*').eq('id', req.params.id).single();
    if (error || !appItem) return res.status(404).json({ error: "Application not found" });

    const { data: interview } = await supabase.from('interviews').select('*').eq('application_id', appItem.id).single();
    const { data: profile } = await supabase.from('applicant_profiles').select('*').eq('user_id', appItem.applicant_id).single();

    res.json({
      application: {
        ...appItem,
        jobId: appItem.job_id,
        applicantId: appItem.applicant_id,
        coverLetter: appItem.cover_letter,
        coverLetterUrl: appItem.cover_letter_url,
        coverLetterFileName: appItem.cover_letter_file_name,
        resumeUrl: appItem.resume_url,
        resumeFileName: appItem.resume_file_name,
        jobTitle: appItem.job_title,
        jobDepartment: appItem.job_department,
        jobLocation: appItem.job_location,
        jobEmploymentType: appItem.job_employment_type,
        applicantName: appItem.applicant_name,
        applicantEmail: appItem.applicant_email,
        applicantPhone: appItem.applicant_phone,
        applicantSkills: appItem.applicant_skills,
        appliedAt: appItem.applied_at,
        updatedAt: appItem.updated_at
      },
      interview: interview ? {
        ...interview,
        applicationId: interview.application_id,
        jobId: interview.job_id,
        applicantId: interview.applicant_id,
        scheduledDate: interview.scheduled_date,
        scheduledTime: interview.scheduled_time,
        locationOrLink: interview.location_or_link,
        interviewerId: interview.interviewer_id,
        interviewerName: interview.interviewer_name,
        applicantName: interview.applicant_name,
        applicantEmail: interview.applicant_email,
        jobTitle: interview.job_title,
        createdAt: interview.created_at
      } : null,
      profile: profile ? {
        ...profile,
        userId: profile.user_id,
        resumeUrl: profile.resume_url,
        resumeFileName: profile.resume_file_name,
        resumeUploadedAt: profile.resume_uploaded_at,
        coverLetterUrl: profile.cover_letter_url,
        coverLetterFileName: profile.cover_letter_file_name,
        coverLetterUploadedAt: profile.cover_letter_uploaded_at,
        linkedinUrl: profile.linkedin_url,
        githubUrl: profile.github_url,
        portfolioUrl: profile.portfolio_url
      } : null
    });
  });

  // Applications: Update Status
  app.put("/api/applications/:id/status", async (req, res) => {
    const appId = req.params.id;
    const { status, feedback } = req.body;

    const { data: appItem } = await supabase.from('applications').select('*').eq('id', appId).single();
    if (!appItem) return res.status(404).json({ error: "Application not found" });

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (feedback !== undefined) updates.feedback = feedback;

    await supabase.from('applications').update(updates).eq('id', appId);

    await supabase.from('notifications').insert({
      id: genId("notif"),
      user_id: appItem.applicant_id,
      title: `Application ${status}`,
      message: `Your application status for "${appItem.job_title}" has been updated to "${status}".${feedback ? ` HR Feedback: "${feedback}"` : ""}`,
      type: status === "Rejected" ? "warning" : status === "Hired" ? "success" : "status_change",
      related_job_id: appItem.job_id,
      related_application_id: appItem.id
    });

    const { data: updated } = await supabase.from('applications').select('*').eq('id', appId).single();
    res.json({
        ...updated,
        jobId: updated.job_id,
        applicantId: updated.applicant_id,
        coverLetter: updated.cover_letter,
        coverLetterUrl: updated.cover_letter_url,
        coverLetterFileName: updated.cover_letter_file_name,
        resumeUrl: updated.resume_url,
        resumeFileName: updated.resume_file_name,
        jobTitle: updated.job_title,
        jobDepartment: updated.job_department,
        jobLocation: updated.job_location,
        jobEmploymentType: updated.job_employment_type,
        applicantName: updated.applicant_name,
        applicantEmail: updated.applicant_email,
        applicantPhone: updated.applicant_phone,
        applicantSkills: updated.applicant_skills,
        appliedAt: updated.applied_at,
        updatedAt: updated.updated_at
    });
  });

  // Applications: Bulk Update
  app.put("/api/applications/bulk-status", async (req, res) => {
    const { applicationIds, status, feedback } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0 || !status) {
      return res.status(400).json({ error: "applicationIds array and status are required" });
    }

    let updatedCount = 0;
    for (const id of applicationIds) {
      const { data: appItem } = await supabase.from('applications').select('*').eq('id', id).single();
      if (appItem) {
        const updates: any = { status, updated_at: new Date().toISOString() };
        if (feedback) updates.feedback = feedback;
        await supabase.from('applications').update(updates).eq('id', id);

        await supabase.from('notifications').insert({
          id: genId("notif"),
          user_id: appItem.applicant_id,
          title: `Application ${status}`,
          message: `Your application status for "${appItem.job_title}" has been updated to "${status}".`,
          type: status === "Rejected" ? "warning" : status === "Hired" ? "success" : "status_change",
          related_job_id: appItem.job_id,
          related_application_id: appItem.id
        });
        updatedCount++;
      }
    }
    res.json({ success: true, updatedCount });
  });

  // Interviews: Schedule
  app.post("/api/interviews", async (req, res) => {
    const { applicationId, scheduledDate, scheduledTime, mode, locationOrLink, interviewerId, notes } = req.body;
    if (!applicationId || !scheduledDate || !scheduledTime) return res.status(400).json({ error: "Required fields missing" });

    const { data: appItem } = await supabase.from('applications').select('*').eq('id', applicationId).single();
    if (!appItem) return res.status(404).json({ error: "Application not found" });

    const { data: interviewer } = await supabase.from('users').select('*').eq('id', interviewerId).single();

    const newInterview = {
      id: genId("int"),
      application_id: applicationId,
      job_id: appItem.job_id,
      applicant_id: appItem.applicant_id,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      mode: mode || "virtual",
      location_or_link: locationOrLink || "https://meet.google.com/hirepulse-interview",
      interviewer_id: interviewer?.id || null,
      interviewer_name: interviewer?.name || "HR Staff",
      outcome: "Pending",
      notes: notes || "",
      applicant_name: appItem.applicant_name,
      applicant_email: appItem.applicant_email,
      job_title: appItem.job_title
    };

    const { data: existing } = await supabase.from('interviews').select('id').eq('application_id', applicationId).single();
    if (existing) {
      await supabase.from('interviews').update(newInterview).eq('id', existing.id);
    } else {
      await supabase.from('interviews').insert(newInterview);
    }

    await supabase.from('applications').update({ status: 'Interview Scheduled', updated_at: new Date().toISOString() }).eq('id', applicationId);

    await supabase.from('notifications').insert({
      id: genId("notif"),
      user_id: appItem.applicant_id,
      title: "Interview Scheduled!",
      message: `An interview for "${appItem.job_title}" has been scheduled.`,
      type: "interview",
      related_job_id: appItem.job_id,
      related_application_id: appItem.id
    });

    res.status(201).json({ ...newInterview, applicationId: newInterview.application_id });
  });

  // Interviews: List
  app.get("/api/interviews", async (req, res) => {
    const { applicantId, interviewerId, outcome } = req.query;
    let query = supabase.from('interviews').select('*');

    if (applicantId) query = query.eq('applicant_id', applicantId);
    if (interviewerId) query = query.eq('interviewer_id', interviewerId);
    if (outcome && outcome !== "All") query = query.eq('outcome', outcome);

    const { data: result } = await query;
    const formattedResult = (result || []).map(i => ({
        ...i,
        applicationId: i.application_id,
        jobId: i.job_id,
        applicantId: i.applicant_id,
        scheduledDate: i.scheduled_date,
        scheduledTime: i.scheduled_time,
        locationOrLink: i.location_or_link,
        interviewerId: i.interviewer_id,
        interviewerName: i.interviewer_name,
        applicantName: i.applicant_name,
        applicantEmail: i.applicant_email,
        jobTitle: i.job_title,
        createdAt: i.created_at
    }));
    res.json(formattedResult);
  });

  // Interviews: Update Outcome
  app.put("/api/interviews/:id", async (req, res) => {
    const intId = req.params.id;
    const { outcome, notes } = req.body;

    const { data: interview } = await supabase.from('interviews').select('*').eq('id', intId).single();
    if (!interview) return res.status(404).json({ error: "Interview record not found" });

    const updates: any = {};
    if (outcome) updates.outcome = outcome;
    if (notes !== undefined) updates.notes = notes;

    await supabase.from('interviews').update(updates).eq('id', intId);

    if (outcome === "Hired") {
      const { data: appItem } = await supabase.from('applications').select('*').eq('id', interview.application_id).single();
      if (appItem) {
        await supabase.from('applications').update({ status: 'Hired', updated_at: new Date().toISOString() }).eq('id', appItem.id);
        
        await supabase.from('notifications').insert({
          id: genId("notif"),
          user_id: appItem.applicant_id,
          title: "Congratulations! Job Offer Extended",
          message: `We are delighted to offer you the position of "${appItem.job_title}" at HirePulse!`,
          type: "success",
          related_job_id: appItem.job_id,
          related_application_id: appItem.id
        });
      }
    }

    res.json({ ...interview, ...updates });
  });

  // Users: List
  app.get("/api/users", async (req, res) => {
    const { role } = req.query;
    let query = supabase.from('users').select('*');
    if (role) query = query.eq('role', role);
    const { data: result } = await query;
    res.json((result || []).map(u => ({ ...u, permissionLevel: u.permission_level, avatarUrl: u.avatar_url, createdAt: u.created_at })));
  });

  // Users: Status
  app.put("/api/users/:id/status", async (req, res) => {
    const { status } = req.body;
    await supabase.from('users').update({ status }).eq('id', req.params.id);
    const { data: user } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    res.json({ ...user, permissionLevel: user.permission_level, avatarUrl: user.avatar_url, createdAt: user.created_at });
  });

  // Users: Permission
  app.put("/api/users/:id/permission", async (req, res) => {
    const { permissionLevel } = req.body;
    await supabase.from('users').update({ permission_level: permissionLevel }).eq('id', req.params.id);
    const { data: user } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    res.json({ ...user, permissionLevel: user.permission_level, avatarUrl: user.avatar_url, createdAt: user.created_at });
  });

  // Users: Delete
  app.delete("/api/users/:id", async (req, res) => {
    await supabase.from('users').delete().eq('id', req.params.id);
    res.json({ success: true, message: "User account deleted" });
  });

  // Users: Create HR Staff
  app.post("/api/users/staff", async (req, res) => {
    const { name, email, phone, permissionLevel, department } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const newStaff = {
      id: genId("usr_admin"),
      name,
      email,
      phone: phone || "",
      role: "admin",
      status: "active",
      permission_level: permissionLevel || "hr_staff",
      department: department || "Human Resources",
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`
    };

    await supabase.from('users').insert(newStaff);
    res.status(201).json({ ...newStaff, permissionLevel: newStaff.permission_level, avatarUrl: newStaff.avatar_url });
  });

  // Notifications: List
  app.get("/api/notifications", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const { data: list } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    res.json((list || []).map(n => ({
      ...n,
      userId: n.user_id,
      readStatus: n.read_status,
      relatedJobId: n.related_job_id,
      relatedApplicationId: n.related_application_id,
      createdAt: n.created_at
    })));
  });

  // Notifications: Mark Read
  app.put("/api/notifications/:id/read", async (req, res) => {
    await supabase.from('notifications').update({ read_status: true }).eq('id', req.params.id);
    res.json({ success: true });
  });

  // Notifications: Mark All Read
  app.put("/api/notifications/read-all", async (req, res) => {
    const { userId } = req.body;
    await supabase.from('notifications').update({ read_status: true }).eq('user_id', userId);
    res.json({ success: true });
  });

  // Notifications: Send
  app.post("/api/notifications/send", async (req, res) => {
    const { userIds, title, message, type } = req.body;
    if (!Array.isArray(userIds) || !title || !message) return res.status(400).json({ error: "Invalid parameters" });

    for (const uid of userIds) {
      await supabase.from('notifications').insert({
        id: genId("notif"),
        user_id: uid,
        title,
        message,
        type: type || "info",
        read_status: false
      });
    }
    res.json({ success: true, sentCount: userIds.length });
  });

  // Analytics Dashboard
  app.get("/api/analytics", async (req, res) => {
    const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    const { count: activeJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published');
    const { count: totalApplicants } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'applicant');
    const { count: totalApplications } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    
    const { data: allApps } = await supabase.from('applications').select('status, job_department');
    
    const applications = allApps || [];
    
    const shortlistedCount = applications.filter(a => ['Shortlisted', 'Interview Scheduled', 'Hired'].includes(a.status)).length;
    const hiredCount = applications.filter(a => a.status === 'Hired').length;

    const shortlistingRate = totalApplications ? Math.round((shortlistedCount / totalApplications) * 100) : 0;
    const hiringRate = totalApplications ? Math.round((hiredCount / totalApplications) * 100) : 0;

    const applicationsByStatus: any = {
      "Applied": applications.filter(a => a.status === "Applied").length,
      "Under Review": applications.filter(a => a.status === "Under Review").length,
      "Shortlisted": applications.filter(a => a.status === "Shortlisted").length,
      "Interview Scheduled": applications.filter(a => a.status === "Interview Scheduled").length,
      "Rejected": applications.filter(a => a.status === "Rejected").length,
      "Hired": applications.filter(a => a.status === "Hired").length
    };

    const applicationsByDepartment: any = {};
    applications.forEach(a => {
      const dept = a.job_department || "General";
      applicationsByDepartment[dept] = (applicationsByDepartment[dept] || 0) + 1;
    });

    const monthlyTrends = [
      { month: "Jan", applications: 12, hires: 2 },
      { month: "Feb", applications: 25, hires: 4 },
      { month: "Mar", applications: 38, hires: 6 },
      { month: "Apr", applications: 18, hires: 3 },
      { month: "May", applications: 29, hires: 5 },
      { month: "Jun", applications: 42, hires: 8 }
    ];

    res.json({
      totalJobs: totalJobs || 0,
      activeJobs: activeJobs || 0,
      totalApplicants: totalApplicants || 0,
      totalApplications: totalApplications || 0,
      shortlistingRate,
      hiringRate,
      applicationsByStatus,
      applicationsByDepartment,
      monthlyTrends
    });
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HirePulse HR Recruitment backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
"""

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
