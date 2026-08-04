import React, { useState, useEffect } from "react";
import { Job } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { 
  Search, 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock, 
  Filter, 
  ArrowRight, 
  Briefcase,
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  HeartHandshake,
  Code,
  Palette,
  Layers,
  BarChart3,
  Megaphone,
  UserCheck,
  FileText,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

interface JobCatalogProps {
  onSelectJob: (job: Job) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const JobCatalog: React.FC<JobCatalogProps> = ({ onSelectJob, onNavigateToTab }) => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [locationType, setLocationType] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [minSalary, setMinSalary] = useState<number>(0);

  const departments = ["All", "Engineering", "Design", "Product", "Data & Analytics", "Marketing", "Human Resources"];
  const locationTypes = ["All", "Remote", "Hybrid", "On-site"];
  const employmentTypes = ["All", "Full-time", "Part-time", "Contract", "Internship"];

  // Department metadata for career tracks section
  const categoryCards = [
    { name: "Engineering", icon: Code, desc: "Software, Architecture & DevOps", count: 4, color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 border-indigo-200" },
    { name: "Design", icon: Palette, desc: "UI/UX, Product Design & Motion", count: 2, color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200" },
    { name: "Product", icon: Layers, desc: "Strategy, Roadmaps & Delivery", count: 2, color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200" },
    { name: "Data & Analytics", icon: BarChart3, desc: "AI, Machine Learning & BI", count: 2, color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200" },
    { name: "Marketing", icon: Megaphone, desc: "Growth, Brand & Acquisition", count: 1, color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200" },
    { name: "Human Resources", icon: Users, desc: "Talent, Operations & Culture", count: 1, color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-200" },
  ];

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJobs({
        search,
        department,
        locationType,
        employmentType,
        status: "published",
        salaryMin: minSalary > 0 ? minSalary : undefined
      });
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, department, locationType, employmentType, minSalary]);

  // Handle department filter shortcut click
  const handleDepartmentSelect = (deptName: string) => {
    setDepartment(deptName);
    // Smooth scroll to jobs catalog section
    const catalogEl = document.getElementById("job-listings-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mb-20 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>HirePulse Talent Ecosystem</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 text-[11px]">12 Active Requisitions</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Discover Roles That <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-100 bg-clip-text text-transparent">
              Define Your Next Chapter
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience complete recruitment transparency with clear salary bands, structured interview workflows, and direct status updates.
          </p>

          {/* Search Box Card */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center w-full px-3 py-2 bg-white/10 rounded-xl border border-white/10 text-white focus-within:bg-white/20 transition-all">
                <Search className="w-4 h-4 text-slate-300 shrink-0 mr-2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, skill (e.g. React, Node, Product), or keyword..."
                  className="w-full bg-transparent border-0 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-slate-400 hover:text-white ml-2"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button 
                onClick={() => {
                  const catalogEl = document.getElementById("job-listings-section");
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all shrink-0 flex items-center justify-center gap-2"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Department Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Popular Tracks:</span>
              {departments.slice(1, 6).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDepartmentSelect(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    department === d
                      ? "bg-indigo-500 text-white font-bold"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. LOGGED-IN CANDIDATE QUICK STATUS WIDGET */}
      {user && user.role === "applicant" && (
        <section className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 border border-indigo-700/50 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">Welcome back, {user.name}!</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                  Candidate Profile Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Profile completeness: <strong className="text-white">85%</strong> • Keep your resume & bio updated for 1-click apply.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToTab && (
              <>
                <button
                  onClick={() => onNavigateToTab("my_applications")}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-300" />
                  View My Applications
                </button>
                <button
                  onClick={() => onNavigateToTab("profile")}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* 3. PLATFORM KEY METRICS BAR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">12 Active</p>
            <p className="text-[11px] text-slate-500 font-medium">Open Requisitions</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">&lt; 48 Hours</p>
            <p className="text-[11px] text-slate-500 font-medium">Avg Review Response</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">100% Clear</p>
            <p className="text-[11px] text-slate-500 font-medium">Upfront Salary Bands</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">Remote & HQ</p>
            <p className="text-[11px] text-slate-500 font-medium">Flexible Work Modes</p>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE BY CAREER TRACKS / DEPARTMENTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Explore Career Tracks</h2>
            <p className="text-xs text-slate-500">Find opportunities categorized by domain and specialized team expertise.</p>
          </div>
          {department !== "All" && (
            <button
              onClick={() => setDepartment("All")}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Show All Tracks ({jobs.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const isSelected = department === cat.name;

            return (
              <div
                key={cat.name}
                onClick={() => handleDepartmentSelect(cat.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300"
                    : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${isSelected ? "bg-white/20 text-white" : cat.color} transition-colors`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                    }`}>
                      {cat.count} role{cat.count !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm ${isSelected ? "text-white" : "text-slate-900 group-hover:text-indigo-600"}`}>
                    {cat.name}
                  </h3>
                  <p className={`text-xs ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                    {cat.desc}
                  </p>
                </div>

                <ChevronRight className={`w-4 h-4 self-center ${isSelected ? "text-white" : "text-slate-400 group-hover:text-indigo-600"} transition-transform group-hover:translate-x-0.5`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RECRUITMENT TRANSPARENCY ROADMAP */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Our Candidate Promise</span>
          <h2 className="text-xl sm:text-2xl font-black">Transparent 4-Step Hiring Process</h2>
          <p className="text-xs text-slate-400">No black holes or silent rejections. Track every step of your application in real time.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-400/30">
              01
            </div>
            <h4 className="font-bold text-sm text-white">1-Click Application</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Submit your saved profile or upload a custom PDF resume in under 2 minutes.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-400/30">
              02
            </div>
            <h4 className="font-bold text-sm text-white">HR Review & Shortlist</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Our hiring managers review every submission and notify you of decision status.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-400/30">
              03
            </div>
            <h4 className="font-bold text-sm text-white">Structured Interview</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Schedule virtual or in-person sessions with clear interviewer feedback notes.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-400/30">
              04
            </div>
            <h4 className="font-bold text-sm text-white">Offer & Onboarding</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Receive formal offer letters and digital onboarding docs with swift turnaround.
            </p>
          </div>

        </div>
      </section>

      {/* 6. MAIN FILTERABLE JOB CATALOG */}
      <section id="job-listings-section" className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              All Available Positions
            </h2>
            <p className="text-xs text-slate-500">Filter by department, workplace mode, salary range, or employment commitment.</p>
          </div>

          {/* Applied Filter Tags indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium">Active filter:</span>
            <span className="font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              {department}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filter Jobs
              </h3>
              <button
                onClick={() => {
                  setSearch("");
                  setDepartment("All");
                  setLocationType("All");
                  setEmploymentType("All");
                  setMinSalary(0);
                }}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                Reset All
              </button>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Workplace Location Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Workplace Type</label>
              <div className="flex flex-wrap gap-1.5">
                {locationTypes.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocationType(loc)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                      locationType === loc
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Employment Type</label>
              <div className="flex flex-wrap gap-1.5">
                {employmentTypes.map((emp) => (
                  <button
                    key={emp}
                    onClick={() => setEmploymentType(emp)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                      employmentType === emp
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {emp}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Salary Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Minimum Annual Salary</label>
                <span className="text-xs font-bold text-indigo-600">
                  {minSalary > 0 ? `$${(minSalary / 1000).toFixed(0)}k+` : "Any"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200000}
                step={10000}
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Job Cards Stream */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Showing <strong className="text-slate-900">{jobs.length}</strong> available position{jobs.length !== 1 ? "s" : ""}</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 rounded-md w-1/3" />
                    <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                    <div className="h-12 bg-slate-100 rounded-md w-full" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No jobs match your filter criteria</h3>
                <p className="text-slate-500 text-xs mt-1">Try adjusting your keyword search, salary threshold, or department selection.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setDepartment("All");
                    setLocationType("All");
                    setEmploymentType("All");
                    setMinSalary(0);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Reset Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {job.department}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {job.locationType}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            {job.type}
                          </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h3>
                        
                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <button className="px-4 py-2 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs">
                          View Details & Apply
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Requirements Preview Tags */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {job.requirements.slice(0, 3).map((req, idx) => (
                          <span key={idx} className="text-[11px] bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-100 line-clamp-1">
                            ✓ {req}
                          </span>
                        ))}
                        {job.requirements.length > 3 && (
                          <span className="text-[11px] text-slate-400 self-center font-medium">
                            +{job.requirements.length - 3} more skills
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 7. PERKS & CULTURE SECTION */}
      <section className="bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Life at HirePulse</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Why Top Talent Chooses Us</h2>
          <p className="text-xs text-slate-500">We invest heavily in human potential, continuous growth, and team wellbeing.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Competitive Equity & Pay</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Top 10% market benchmarked compensation with stock options and performance bonuses.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Learning & Education Fund</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              $2,500 annual stipend for conferences, certifications, online courses, and book allowances.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Comprehensive Wellness</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full medical, dental, and vision coverage, mental health coaching, plus flexible PTO policies.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

