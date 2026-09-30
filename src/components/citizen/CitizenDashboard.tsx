import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle,
  Truck,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { MascotDog, MascotBin, TurtleAwarenessBadge } from '../brand/Mascots';

export const CitizenDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    pickups,
    setActiveTab,
    setSelectedComplaintId,
  } = useApp();

  const userComplaints = complaints.filter(
    (c) =>
      (c.reporterId && c.reporterId === currentUser.uid) ||
      (currentUser.name && c.reporterName?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  const activeComplaints = userComplaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  );

  const resolvedComplaints = userComplaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  );

  const userPickups = pickups.filter(
    (p) =>
      (p.requesterId && p.requesterId === currentUser.uid) ||
      (currentUser.name && p.requesterName?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  const activePickups = userPickups.filter((p) => p.status !== 'Completed');

  const statusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return { text: 'Submitted', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'under_review':
        return { text: 'Under Review', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'assigned':
        return { text: 'Assigned', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'in_progress':
        return { text: 'In Progress', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'resolved':
        return { text: 'Resolved', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'closed':
        return { text: 'Closed', color: 'text-slate-600 bg-slate-50 border-slate-200' };
      default:
        return { text: status, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section - Translucent Glassmorphic Floating Panel */}
      <section className="glass-hero relative overflow-hidden rounded-[32px] p-8 md:p-10 transition-all duration-300">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5F29] dark:text-[#DAE3B7] bg-[#DAE3B7]/50 dark:bg-[#4A5F29]/30 border border-white/60 dark:border-white/10 px-3 py-1 rounded-full mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#4A5F29] dark:bg-[#DAE3B7] animate-pulse" />
            Civic Cleanliness Platform
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14200C] dark:text-[#F2F6ED] leading-tight mb-4">
            Report waste easily <span className="text-[#4A5F29] dark:text-[#DAE3B7]">→</span> Track what happens <span className="text-[#4A5F29] dark:text-[#DAE3B7]">→</span> Keep the community clean.
          </h1>

          <p className="text-base text-[#14200C]/85 dark:text-[#F2F6ED]/85 mb-6 leading-relaxed">
            Welcome back, <strong className="font-semibold text-[#14200C] dark:text-[#F2F6ED]">{currentUser.name}</strong>. Real-time municipal dispatch for your neighborhood in <span className="underline decoration-[#4A5F29]/60">{currentUser.area}</span>. Every report is audited and tracked step-by-step.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('report')}
              className="glass-button-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold"
            >
              <span>Report Waste</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('pickups')}
              className="glass-button-secondary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
            >
              <span>Schedule Pickup</span>
            </button>
          </div>
        </div>

        {/* Mascot decoration */}
        <div className="absolute right-4 md:right-10 bottom-0 pointer-events-none hidden md:block opacity-95 hover:opacity-100 transition-opacity drop-shadow-md">
          <MascotDog size={160} />
        </div>
      </section>

      {/* Synchronized Metrics Grid - Primary Glass Panels */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Complaints Card */}
        <div
          onClick={() => setActiveTab('my-complaints')}
          className="glass-card-primary cursor-pointer group p-5 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#14200C]/75 dark:text-[#F2F6ED]/75 uppercase tracking-wider">Active Complaints</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#14200C] dark:text-[#F2F6ED] font-tabular">
              {activeComplaints.length}
            </span>
            <span className="text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 font-medium">in pipeline</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-[#4A5F29] dark:text-[#DAE3B7] group-hover:underline">
            <span>View reports</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Resolved Cleanups */}
        <div
          onClick={() => setActiveTab('my-complaints')}
          className="glass-card-primary cursor-pointer group p-5 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#14200C]/75 dark:text-[#F2F6ED]/75 uppercase tracking-wider">Resolved Cleanups</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#14200C] dark:text-[#F2F6ED] font-tabular">
              {resolvedComplaints.length}
            </span>
            <span className="text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 font-medium">verified</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-[#4A5F29] dark:text-[#DAE3B7] group-hover:underline">
            <span>View history</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Scheduled Pickups */}
        <div
          onClick={() => setActiveTab('pickups')}
          className="glass-card-primary cursor-pointer group p-5 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#14200C]/75 dark:text-[#F2F6ED]/75 uppercase tracking-wider">Scheduled Pickups</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 dark:bg-blue-400/20 text-blue-800 dark:text-blue-300 border border-blue-500/20 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#14200C] dark:text-[#F2F6ED] font-tabular">
              {activePickups.length}
            </span>
            <span className="text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 font-medium">upcoming</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-[#4A5F29] dark:text-[#DAE3B7] group-hover:underline">
            <span>View calendar</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Community Score / Zonal Health */}
        <div className="glass-card-primary p-5 rounded-2xl group hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#14200C]/75 dark:text-[#F2F6ED]/75 uppercase tracking-wider">Zonal Health</span>
            <div className="w-9 h-9 rounded-xl bg-[#4A5F29]/15 dark:bg-[#DAE3B7]/20 text-[#4A5F29] dark:text-[#DAE3B7] border border-[#4A5F29]/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#4A5F29] dark:text-[#DAE3B7] font-tabular">94%</span>
            <span className="text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 font-medium">Clean SLA</span>
          </div>
          <p className="mt-3 text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 truncate font-medium">College Rd & Sector A green zone</p>
        </div>
      </section>

      {/* Quick Action Cards & Live Timeline Preview - Secondary Glass Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Complaint Spotlight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#14200C] dark:text-[#F2F6ED]">Your Active Reports</h2>
              <p className="text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 font-medium">Real-time municipal tracking and dispatch</p>
            </div>
            <button
              onClick={() => setActiveTab('my-complaints')}
              className="text-xs font-bold text-[#4A5F29] dark:text-[#DAE3B7] hover:underline flex items-center gap-1"
            >
              <span>See all ({userComplaints.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeComplaints.length === 0 ? (
            <div className="glass-card-secondary p-8 text-center rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#DAE3B7]/60 dark:bg-[#4A5F29]/30 text-[#4A5F29] dark:text-[#DAE3B7] flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">All clean! No active complaints.</h3>
              <p className="text-xs text-[#14200C]/75 dark:text-[#F2F6ED]/75 mt-1 max-w-sm mx-auto">
                Spotted an overflowing bin or illegal trash dumping? Help your neighbors by lodging a report.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="glass-button-primary mt-4 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Report Waste Issue
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeComplaints.slice(0, 3).map((complaint) => {
                const badge = statusLabel(complaint.status);
                return (
                  <div
                    key={complaint.id}
                    onClick={() => {
                      setSelectedComplaintId(complaint.id);
                    }}
                    className="glass-card-secondary p-5 rounded-2xl hover:border-[#4A5F29]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 px-2 py-0.5 rounded">
                          {complaint.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold backdrop-blur-xs ${badge.color}`}>
                          {badge.text}
                        </span>
                        <span className="text-[#14200C]/40 dark:text-white/40 text-[11px]">·</span>
                        <span className="text-[#14200C]/75 dark:text-[#F2F6ED]/75 font-medium text-[11px]">{complaint.category}</span>
                      </div>

                      <h3 className="text-sm font-bold text-[#14200C] dark:text-[#F2F6ED] truncate">
                        {complaint.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                          <span>{complaint.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </span>
                        {complaint.assignedWorker && (
                          <span className="text-[#4A5F29] dark:text-[#DAE3B7] font-semibold hidden sm:inline">
                            Worker: {complaint.assignedWorker.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaintId(complaint.id);
                        }}
                        className="glass-button-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Eco Awareness & Mascot Prompt */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#14200C] dark:text-[#F2F6ED]">Daily Civic Action</h2>

          <div className="glass-card-secondary p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-[#DAE3B7]/60 dark:bg-[#4A5F29]/30 flex items-center justify-center text-[#4A5F29] dark:text-[#DAE3B7]">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#4A5F29] dark:text-[#DAE3B7] uppercase tracking-wider bg-[#DAE3B7]/60 dark:bg-[#4A5F29]/40 border border-white/50 dark:border-white/10 px-2.5 py-0.5 rounded-full">
                Green Habit
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#14200C] dark:text-[#F2F6ED]">Keep Dry & Wet Waste Segregated</h3>
              <p className="text-xs text-[#14200C]/80 dark:text-[#F2F6ED]/80 mt-1 leading-relaxed font-medium">
                Kitchen organic peels go to the Green Bin. Paper, plastic wrappers, cardboard, and metals must stay dry for collection.
              </p>
            </div>

            <div className="flex items-center justify-center py-2">
              <TurtleAwarenessBadge size={90} />
            </div>

            <button
              onClick={() => setActiveTab('awareness')}
              className="glass-button-secondary w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center block"
            >
              Explore Waste Sorting Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
