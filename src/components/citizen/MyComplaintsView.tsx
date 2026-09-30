import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintStatus } from '../../types';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const MyComplaintsView: React.FC = () => {
  const {
    currentUser,
    complaints,
    setActiveTab,
    selectedComplaintId,
    setSelectedComplaintId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | ComplaintStatus>('all');

  const userComplaints = complaints.filter(
    (c) =>
      (c.reporterId && c.reporterId === currentUser.uid) ||
      (currentUser.name && c.reporterName?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  const filteredComplaints = userComplaints.filter((c) => {
    // Search filter
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return c.status !== 'resolved' && c.status !== 'closed';
    return c.status === statusFilter;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          styles: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'under_review':
        return {
          label: 'Under Review',
          styles: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'assigned':
        return {
          label: 'Assigned',
          styles: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          styles: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          styles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'closed':
        return {
          label: 'Closed',
          styles: 'bg-slate-50 text-slate-700 border-slate-200',
        };
      default:
        return {
          label: status,
          styles: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const activeCount = userComplaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  ).length;

  const resolvedCount = userComplaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#14200C]/08">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#14200C] tracking-tight">
            My Waste Complaints
          </h1>
          <p className="text-xs md:text-sm text-[#969691] mt-1">
            Tracking logged reports filed by <strong className="text-[#14200C]">{currentUser.name}</strong>
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A5F29] text-white text-xs font-semibold hover:bg-[#3d4f21] transition-smooth self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Waste</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 glass-card-subtle rounded-xl overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-smooth ${
              statusFilter === 'all'
                ? 'bg-[#4A5F29] text-white shadow-2xs'
                : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
            }`}
          >
            All ({userComplaints.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-smooth ${
              statusFilter === 'active'
                ? 'bg-[#4A5F29] text-white shadow-2xs'
                : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-smooth ${
              statusFilter === 'submitted'
                ? 'bg-[#4A5F29] text-white shadow-2xs'
                : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-smooth ${
              statusFilter === 'in_progress'
                ? 'bg-[#4A5F29] text-white shadow-2xs'
                : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-smooth ${
              statusFilter === 'resolved'
                ? 'bg-[#4A5F29] text-white shadow-2xs'
                : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#969691] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket ID or location..."
            className="w-full pl-9 pr-4 py-2 bg-white/70 dark:bg-[#182214]/80 backdrop-blur-md border border-white/60 dark:border-white/15 rounded-xl text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] placeholder:text-[#969691] focus:outline-hidden focus:border-[#4A5F29]"
          />
        </div>
      </div>

      {/* Complaint List */}
      {filteredComplaints.length === 0 ? (
        <div className="p-12 text-center glass-card-primary rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#DAE3B7]/60 dark:bg-[#4A5F29]/30 text-[#4A5F29] dark:text-[#DAE3B7] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">No complaints found</h3>
          <p className="text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 max-w-sm mx-auto">
            {searchQuery
              ? `No reports match query "${searchQuery}". Clear search or adjust filter.`
              : 'You have not submitted complaints under this filter.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="glass-button-secondary px-4 py-2 rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => {
            const badge = getStatusBadge(complaint.status);
            return (
              <div
                key={complaint.id}
                onClick={() => setSelectedComplaintId(complaint.id)}
                className="group p-5 glass-card-primary rounded-2xl hover:border-[#4A5F29]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 px-2.5 py-0.5 rounded">
                      {complaint.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded border text-[11px] font-bold ${badge.styles}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[#14200C]/40 dark:text-white/40">·</span>
                    <span className="text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED]">
                      {complaint.category}
                    </span>
                    <span className="text-[#14200C]/40 dark:text-white/40">·</span>
                    <span
                      className={`text-[11px] font-bold ${
                        complaint.priority === 'Urgent'
                          ? 'text-red-700 dark:text-red-400'
                          : complaint.priority === 'High'
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-[#4A5F29] dark:text-[#DAE3B7]'
                      }`}
                    >
                      {complaint.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#14200C] dark:text-[#F2F6ED] group-hover:text-[#4A5F29] transition-colors">
                    {complaint.title}
                  </h3>

                  <p className="text-xs text-[#14200C]/75 dark:text-[#F2F6ED]/75 line-clamp-1 font-medium">
                    {complaint.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#14200C]/70 dark:text-[#F2F6ED]/70 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                      <span>{complaint.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </span>
                    {complaint.assignedWorker && (
                      <span className="text-[#4A5F29] dark:text-[#DAE3B7] font-semibold">
                        Worker: {complaint.assignedWorker.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedComplaintId(complaint.id);
                    }}
                    className="glass-button-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <span>View Timeline</span>
                    <ChevronRight className="w-4 h-4 text-[#4A5F29] dark:text-[#DAE3B7]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Complaint Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}
    </div>
  );
};
