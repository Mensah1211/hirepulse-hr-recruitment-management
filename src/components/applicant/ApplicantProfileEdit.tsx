import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Education, Experience } from "../../types";
import { User, FileText, Upload, Plus, Trash2, Check, Save, GraduationCap, Briefcase, Link, Sparkles, Camera } from "lucide-react";

export const ApplicantProfileEdit: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [title, setTitle] = useState(profile?.title || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || "");

  // Skills
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState("");

  // Education & Experience
  const [educationList, setEducationList] = useState<Education[]>(profile?.education || []);
  const [experienceList, setExperienceList] = useState<Experience[]>(profile?.experience || []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setName(user.name);
      setPhone(user.phone);
      setAvatarUrl(user.avatarUrl || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setLinkedinUrl(profile.linkedinUrl || "");
      setGithubUrl(profile.githubUrl || "");
      setPortfolioUrl(profile.portfolioUrl || "");
      setSkills(profile.skills || []);
      setEducationList(profile.education || []);
      setExperienceList(profile.experience || []);
    }
  }, [user, profile]);

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Invalid image file format. Please upload a JPEG, PNG, or WEBP photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile picture file size must not exceed 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      degree: "B.S. in Computer Science",
      institution: "University",
      year: "2020 - 2024"
    };
    setEducationList([...educationList, newEdu]);
  };

  const handleUpdateEducation = (id: string, field: keyof Education, value: string) => {
    setEducationList(educationList.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList(educationList.filter(e => e.id !== id));
  };

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      title: "Software Engineer",
      company: "Company Name",
      duration: "2022 - Present",
      description: "Brief summary of responsibilities and key impact achievements."
    };
    setExperienceList([...experienceList, newExp]);
  };

  const handleUpdateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperienceList(experienceList.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceList(experienceList.filter(e => e.id !== id));
  };

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Only PDF files (.pdf) are supported.");
      return;
    }

    setUploadingResume(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await api.uploadResume(user.id, file.name, base64);
        await refreshProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCoverLetterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Only PDF files (.pdf) are supported.");
      return;
    }

    setUploadingCoverLetter(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await api.uploadCoverLetter(user.id, file.name, base64);
        await refreshProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingCoverLetter(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({
        userId: user.id,
        name,
        phone,
        avatarUrl,
        title,
        bio,
        skills,
        education: educationList,
        experience: experienceList,
        linkedinUrl,
        githubUrl,
        portfolioUrl
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Applicant Profile & Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Keep your profile up to date for 1-click quick job applications and HR review.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? (
            "Saving..."
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Personal Details Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            Personal & Contact Information
          </h3>

          {/* Profile Picture Upload Section */}
          <div className="flex flex-row items-center gap-3.5 p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center shrink-0 shadow-xs">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile Photo" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
              )}
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-xs">Profile Picture</p>
              <p className="text-[11px] text-slate-500 hidden sm:block">Upload a professional photo or headshot (JPG, PNG or WEBP up to 5MB).</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-xs whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1">Professional Bio Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your years of experience, core competencies, and career objectives..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Resume Attachment Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-indigo-600" />
            Resume / CV Document
          </h3>

          <div className="p-3.5 sm:p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-indigo-600 text-white rounded-xl shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-xs truncate">
                  {profile?.resumeFileName || "No resume uploaded yet"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {profile?.resumeUploadedAt 
                    ? `Uploaded on ${new Date(profile.resumeUploadedAt).toLocaleDateString()}` 
                    : "Attach your PDF resume"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              {profile?.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none text-center px-3 py-2 bg-white text-indigo-700 hover:bg-slate-100 border border-indigo-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  View CV
                </a>
              )}

              <label className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span>{uploadingResume ? "Uploading..." : "Upload Resume (PDF)"}</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleResumeFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Cover Letter Document Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-indigo-600" />
            Cover Letter Document
          </h3>

          <div className="p-3.5 sm:p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-indigo-600 text-white rounded-xl shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-xs truncate">
                  {profile?.coverLetterFileName || "No cover letter uploaded yet"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {profile?.coverLetterUploadedAt 
                    ? `Uploaded on ${new Date(profile.coverLetterUploadedAt).toLocaleDateString()}` 
                    : "Attach your default PDF cover letter"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              {profile?.coverLetterUrl && (
                <a
                  href={profile.coverLetterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none text-center px-3 py-2 bg-white text-indigo-700 hover:bg-slate-100 border border-indigo-200 font-semibold text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  View Letter
                </a>
              )}

              <label className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span>{uploadingCoverLetter ? "Uploading..." : "Upload Cover Letter (PDF)"}</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleCoverLetterFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Core Technical Skills & Competencies
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g. React, Python, Product Strategy)..."
              className="flex-1 p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-semibold border border-indigo-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-indigo-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Work Experience
            </h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>

          <div className="space-y-4">
            {experienceList.map((exp) => (
              <div key={exp.id} className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleUpdateExperience(exp.id, "title", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleUpdateExperience(exp.id, "duration", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">Responsibilities & Accomplishments</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => handleUpdateExperience(exp.id, "description", e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education History */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Education History
            </h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Education
            </button>
          </div>

          <div className="space-y-4">
            {educationList.map((edu) => (
              <div key={edu.id} className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(edu.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Degree / Diploma</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, "institution", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Years Attended</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleUpdateEducation(edu.id, "year", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links & Portfolio */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Link className="w-4 h-4 text-indigo-600" />
            Professional Social & Portfolio Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Personal Portfolio / Website</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
