import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintPriority, ComplaintStatus, PickupStatus } from '../../types';
import { AdminTicketModal } from './AdminTicketModal';
import { MUNICIPAL_AREAS } from '../../data/mockData';
import {
  ShieldAlert,
  Search,
  Filter,
  HardHat,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    complaints,
    pickups,
    workers,
    activeTab,
    setActiveTab,
    updateComplaintStatus,
    assignComplaintWorker,
    updatePickupStatus,
    assignPickupWorker,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Pickups management state
  const [pickupSearchQuery, setPickupSearchQuery] = useState('');

  // Priority Queue Stats
  const urgentTickets = complaints.filter(
    (c) => c.priority === 'Urgent' && c.status !== 'resolved' && c.status !== 'closed'
  );
  const activeComplaintsCount = complaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporterName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (areaFilter !== 'all' && c.location !== areaFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;

    return true;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', styles: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'under_review':
        return { label: 'Under Review', styles: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'assigned':
        return { label: 'Assigned', styles: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'in_progress':
        return { label: 'In Progress', styles: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'pending_verification':
        return { label: 'Pending Verification', styles: 'bg-yellow-100 text-yellow-900 border-yellow-300' };
      case 'resolved':
        return { label: 'Resolved', styles: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'reopened':
        return { label: 'Reopened', styles: 'bg-red-100 text-red-900 border-red-300' };
      case 'closed':
        return { label: 'Closed', styles: 'bg-slate-100 text-slate-900 border-slate-300' };
      default:
        return { label: status, styles: 'bg-slate-100 text-slate-900 border-slate-300' };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header */}
      <div className="bg-[#14200C]/85 dark:bg-[#14200C]/90 backdrop-blur-2xl text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-white/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DAE3B7] mb-2">
            <ShieldAlert className="w-4 h-4 text-[#DAE3B7]" />
            <span>Municipal Sanitation Command Desk · Ward 24</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Central Waste Dispatch & Triage
          </h1>
          <p className="text-xs md:text-sm text-white/70 mt-1 max-w-xl">
            Live municipal oversight: assign sanitation crews, manage emergency bio-waste reports, verify before/after cleanups, and track pickup logistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] font-bold text-white/60 tracking-wider">Active Queue</span>
            <p className="text-2xl font-mono font-bold text-[#DAE3B7]">{activeComplaintsCount}</p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-red-500/30 text-center">
            <span className="text-[10px] font-bold text-red-200 tracking-wider">Urgent SLA</span>
            <p className="text-2xl font-mono font-bold text-red-300">{urgentTickets.length}</p>
          </div>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex items-center gap-2 p-1.5 glass-card-subtle rounded-2xl overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('priority-queue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth flex items-center gap-1.5 ${
            activeTab === 'priority-queue'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 hover:text-[#14200C]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Priority Queue ({urgentTickets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('all-complaints')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth flex items-center gap-1.5 ${
            activeTab === 'all-complaints'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 hover:text-[#14200C]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Complaints ({complaints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('admin-pickups')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth flex items-center gap-1.5 ${
            activeTab === 'admin-pickups'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 hover:text-[#14200C]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Pickup Dispatch ({pickups.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth flex items-center gap-1.5 ${
            activeTab === 'workers'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 hover:text-[#14200C]'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" />
          <span>Field Staff ({workers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 hover:text-[#14200C]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Zonal Analytics</span>
        </button>
      </div>

      {/* VIEW: Priority Queue or All Complaints */}
      {(activeTab === 'priority-queue' || activeTab === 'all-complaints') && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#14200C]/08 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#969691] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket (e.g. WM-2026-00125, College Rd)..."
                className="w-full pl-9 pr-4 py-2 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-xs text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-3 py-2 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-xs font-medium text-[#14200C] focus:outline-hidden"
              >
                <option value="all">All Areas</option>
                {MUNICIPAL_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-xs font-medium text-[#14200C] focus:outline-hidden"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent Only</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Tickets Table / Cards */}
          <div className="bg-white rounded-3xl border border-[#14200C]/08 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#14200C]">
                <thead className="bg-[#F7F7F1] border-b border-[#14200C]/08 text-[#969691] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Category & Location</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Assigned Crew</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14200C]/05 font-medium">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-[#969691]">
                        No complaints match your search parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => {
                      const badge = getStatusBadge(c.status);
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-[#F7F7F1]/60 transition-colors cursor-pointer group"
                          onClick={() => setSelectedTicketId(c.id)}
                        >
                          <td className="px-5 py-4 font-mono font-bold text-[#4A5F29]">
                            {c.id}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-[#14200C] group-hover:text-[#4A5F29] transition-colors">
                              {c.title}
                            </p>
                            <p className="text-[#969691] text-[11px] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#4A5F29]" />
                              <span>{c.location}</span>
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                c.priority === 'Urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : c.priority === 'High'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {c.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${badge.styles}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs">
                            {c.assignedWorker ? (
                              <span className="text-[#4A5F29] font-bold flex items-center gap-1">
                                <HardHat className="w-3.5 h-3.5" />
                                {c.assignedWorker.name}
                              </span>
                            ) : (
                              <span className="text-[#969691] italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-[11px] text-[#969691]">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicketId(c.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#EEF0E4] hover:bg-[#DAE3B7] text-[#14200C] font-bold text-xs transition-colors"
                            >
                              Manage Ticket
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Pickup Logistics */}
      {activeTab === 'admin-pickups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#14200C]">Pickup Logistics & Dispatch</h2>
              <p className="text-xs text-[#969691]">Assign municipal collection trucks and advance pickup statuses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pickups.map((p) => {
              const nextStatusMap: Record<PickupStatus, PickupStatus> = {
                Requested: 'Scheduled',
                Scheduled: 'Assigned',
                Assigned: 'Picked Up',
                'Picked Up': 'Completed',
                Completed: 'Completed',
              };
              const nextStatus = nextStatusMap[p.status];

              return (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-3xl border border-[#14200C]/08 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#4A5F29] bg-[#EEF0E4] px-2.5 py-0.5 rounded-md text-xs">
                      {p.id}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {p.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#14200C]">{p.wasteType}</h3>
                    <p className="text-xs text-[#969691] mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{p.scheduledDate} · {p.timeSlot}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F7F1] text-xs space-y-1">
                    <p><strong>Citizen:</strong> {p.requesterName} ({p.requesterPhone})</p>
                    <p><strong>Address:</strong> {p.address}</p>
                    <p><strong>Weight:</strong> {p.estimatedWeight}</p>
                  </div>

                  {/* Worker & Truck Assignment */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#969691]">
                      Assigned Vehicle & Staff
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={p.assignedWorker?.id || ''}
                        onChange={(e) => assignPickupWorker(p.id, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-lg text-xs font-medium text-[#14200C]"
                      >
                        <option value="">Select Truck / Driver</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} (Unit: {w.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Advance Pickup Status Button */}
                  {p.status !== 'Completed' && (
                    <button
                      onClick={() => updatePickupStatus(p.id, nextStatus)}
                      className="w-full py-2 px-3 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold transition-smooth flex items-center justify-center gap-1.5"
                    >
                      <span>Mark: {nextStatus}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: Field Staff Roster */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#14200C]">Sanitation Staff Roster</h2>
              <p className="text-xs text-[#969691]">Active field crews and vehicle assignments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-[#182214] rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 space-y-2">
                <HardHat className="w-10 h-10 text-[#4A5F29] dark:text-[#DAE3B7] mx-auto" />
                <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">No Field Staff Registered in Cloud Firestore</h3>
                <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70">Field staff members will dynamically appear here as they register and log into the municipal mobile dispatch portal.</p>
              </div>
            ) : (
              workers.map((w) => (
                <div
                  key={w.id}
                  className="bg-white p-5 rounded-3xl border border-[#14200C]/08 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#DAE3B7] text-[#4A5F29] flex items-center justify-center font-bold">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        w.status === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800'
                          : w.status === 'Busy'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#14200C]">{w.name}</h3>
                    <p className="text-xs text-[#969691]">{w.unit}</p>
                    <p className="text-xs text-[#4A5F29] font-medium">{w.zone}</p>
                  </div>

                  <div className="pt-2 border-t border-[#14200C]/08 flex items-center justify-between text-xs font-tabular">
                    <span>Active Tasks: <strong>{w.assignedTasks}</strong></span>
                    <span>Resolved: <strong>{w.completedTasks}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: Zonal Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#14200C]">Ward 24 Waste Performance Metrics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#14200C]/08 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#969691]">
                Cleanliness Index by Area
              </span>
              <div className="space-y-3">
                {MUNICIPAL_AREAS.map((area, idx) => {
                  const areaTickets = complaints.filter((c) => c.location === area);
                  const resolvedArea = areaTickets.filter((c) => c.status === 'resolved').length;
                  const rate = areaTickets.length ? Math.round((resolvedArea / areaTickets.length) * 100) : 100;
                  return (
                    <div key={area} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>{area}</span>
                        <span className="font-bold text-[#4A5F29]">{rate}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#F7F7F1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4A5F29] rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#14200C]/08 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#969691]">
                Category Breakdown
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#14200C]/05">
                  <span>Overflowing Bins</span>
                  <strong className="text-[#14200C]">42%</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#14200C]/05">
                  <span>Illegal Dumping</span>
                  <strong className="text-[#14200C]">28%</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#14200C]/05">
                  <span>Broken Bin Infrastructure</span>
                  <strong className="text-[#14200C]">18%</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Hazardous / Bio-Waste</span>
                  <strong className="text-red-700">12%</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#14200C]/08 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#969691]">
                SLA Dispatch Compliance
              </span>
              <p className="text-3xl font-extrabold text-[#4A5F29] font-tabular">96.4%</p>
              <p className="text-xs text-[#969691] leading-relaxed">
                Average emergency response time for Urgent reports is <strong>1 hour 18 minutes</strong> from ticket creation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Ticket Modal */}
      {selectedTicketId && (
        <AdminTicketModal
          complaintId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};
