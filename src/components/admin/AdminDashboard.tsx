import React, { useState, useEffect } from "react";
import { AnalyticsSummary } from "../../types";
import { api } from "../../services/api";
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Send,
  Calendar
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const result = await api.getAnalytics();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <Clock className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading HR Analytics Engine...</p>
      </div>
    );
  }

  // Formatting department data for PieChart
  const deptColors = ["#4f46e5", "#0284c7", "#0d9488", "#16a34a", "#ca8a04", "#dc2626"];
  const deptData = Object.entries(data.applicationsByDepartment).map(([name, value], idx) => ({
    name,
    value,
    color: deptColors[idx % deptColors.length]
  }));

  // Formatting status data for Funnel BarChart
  const statusData = [
    { stage: "Applied", count: data.applicationsByStatus["Applied"] || 0 },
    { stage: "Under Review", count: data.applicationsByStatus["Under Review"] || 0 },
    { stage: "Shortlisted", count: data.applicationsByStatus["Shortlisted"] || 0 },
    { stage: "Interview", count: data.applicationsByStatus["Interview Scheduled"] || 0 },
    { stage: "Hired", count: data.applicationsByStatus["Hired"] || 0 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            HR Recruitment Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time pipeline metrics, application velocity, and talent acquisition analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("jobs_admin")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
          <button
            onClick={() => onNavigateTab("applications_admin")}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            Review Candidates
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Active Jobs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data.activeJobs}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Out of {data.totalJobs} total postings</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Applications</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data.totalApplications}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ +24% vs last month</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Shortlisting Rate</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data.shortlistingRate}%</h3>
            <p className="text-[10px] text-slate-400 mt-1">Candidates passed screening</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Hired Talent</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.applicationsByStatus["Hired"] || 0}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Hiring rate: {data.hiringRate}%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Monthly Application & Hiring Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Application Velocity & Hires</h3>
              <p className="text-xs text-slate-500">Volume of incoming candidates vs finalized job hires</p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              2026 Trend Analysis
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#4f46e5" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} />
                <Area type="monotone" dataKey="hires" name="Hires" stroke="#10b981" fillOpacity={1} fill="url(#colorHires)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Department Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Applications by Department</h3>
            <p className="text-xs text-slate-500">Distribution across active business units</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {deptData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 truncate">{d.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recruitment Funnel Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recruitment Funnel Conversion</h3>
            <p className="text-xs text-slate-500">Candidate progression from Application to Final Offer</p>
          </div>
          <button
            onClick={() => onNavigateTab("applications_admin")}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Manage Applications →
          </button>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={["#3b82f6", "#a855f7", "#f59e0b", "#6366f1", "#10b981"][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
