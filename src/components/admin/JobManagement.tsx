import React, { useState, useEffect } from "react";
import { Job, JobStatus, EmploymentType, LocationType } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../common/StatusBadge";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  X, 
  Check, 
  Eye, 
  FileText 
} from "lucide-react";

interface JobManagementProps {
  onSelectJobApplications?: (jobId: string) => void;
}

export const JobManagement: React.FC<JobManagementProps> = ({ onSelectJobApplications }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("San Francisco, CA");
  const [locationType, setLocationType] = useState<LocationType>("Remote");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("Full-time");
  const [salaryMin, setSalaryMin] = useState<number>(100000);
  const [salaryMax, setSalaryMax] = useState<number>(140000);
  const [deadline, setDeadline] = useState("2026-12-31");
  const [status, setStatus] = useState<JobStatus>("published");
  const [requirements, setRequirements] = useState<string[]>(["3+ years experience", "Strong communication skills"]);
  const [newRequirement, setNewRequirement] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJobs({ search });
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setTitle("");
    setDepartment("Engineering");
    setDescription("");
    setLocation("San Francisco, CA");
    setLocationType("Remote");
    setEmploymentType("Full-time");
    setSalaryMin(100000);
    setSalaryMax(140000);
    setDeadline("2026-12-31");
    setStatus("published");
    setRequirements(["3+ years relevant experience", "Strong team collaboration skills"]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDepartment(job.department);
    setDescription(job.description);
    setLocation(job.location);
    setLocationType(job.locationType);
    setEmploymentType(job.employmentType);
    setSalaryMin(job.salaryMin);
    setSalaryMax(job.salaryMax);
    setDeadline(job.deadline);
    setStatus(job.status);
    setRequirements(job.requirements || []);
    setIsModalOpen(true);
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const jobPayload: Partial<Job> = {
        title,
        department,
        description,
        location,
        locationType,
        employmentType,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        deadline,
        status,
        requirements,
        postedByAdminId: user?.id || "usr_admin_1"
      };

      if (editingJob) {
        await api.updateJob(editingJob.id, jobPayload);
      } else {
        await api.createJob(jobPayload);
      }

      await fetchJobs();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      await api.deleteJob(id);
      await fetchJobs();
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (statusFilter !== "All" && j.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Job Postings Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, publish, or close corporate job requisitions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Job Posting
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title, department, location..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          {["All", "published", "draft", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table Grid */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">Loading job requisitions...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No job postings found</p>
          <p className="text-xs text-slate-500 mt-1">Click "Create Job Posting" above to add your first position.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Job Title & Dept</th>
                  <th className="px-4 py-3.5">Location & Type</th>
                  <th className="px-4 py-3.5">Salary Range</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Applications</th>
                  <th className="px-4 py-3.5">Deadline</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                      <p className="text-[11px] text-slate-500">{job.department} • Posted by {job.postedByName}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-slate-800 font-semibold">{job.location}</p>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                        {job.locationType} • {job.employmentType}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-900">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectJobApplications && onSelectJobApplications(job.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {job.applicationsCount} Candidate{job.applicationsCount !== 1 ? "s" : ""}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                      {new Date(job.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Job"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base sm:text-lg">
                {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {["Engineering", "Design", "Product", "Data & Analytics", "Marketing", "Human Resources"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workplace Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Type</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as LocationType)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posting Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Salary ($/yr)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Salary ($/yr)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive job overview and key role expectations..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Requirements Builder */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Requirements & Qualifications</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add requirement bullet point..."
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span>✓ {req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Job..." : editingJob ? "Update Job Posting" : "Publish Job Posting"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
