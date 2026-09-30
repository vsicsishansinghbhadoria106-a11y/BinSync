import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus } from '../../types';
import {
  X,
  MapPin,
  Clock,
  User,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Camera,
} from 'lucide-react';

interface Props {
  complaintId: string;
  onClose: () => void;
}

export const AdminTicketModal: React.FC<Props> = ({ complaintId, onClose }) => {
  const {
    complaints,
    workers,
    updateComplaintStatus,
    assignComplaintWorker,
    showToast,
  } = useApp();

  const complaint = complaints.find((c) => c.id === complaintId);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    complaint?.assignedWorker?.id || workers[0]?.id || ''
  );
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80'
  );

  if (!complaint) return null;

  const statusWorkflow: {
    status: ComplaintStatus;
    label: string;
    nextLabel: string;
    description: string;
  }[] = [
    {
      status: 'submitted',
      label: 'Submitted',
      nextLabel: 'Mark Under Review',
      description: 'Landed in triage queue, awaiting inspector triage',
    },
    {
      status: 'under_review',
      label: 'Under Review',
      nextLabel: 'Assign Worker',
      description: 'Inspector confirmed location and verified severity',
    },
    {
      status: 'assigned',
      label: 'Assigned',
      nextLabel: 'Dispatch (In Progress)',
      description: 'Field sanitation worker dispatched with equipment',
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      nextLabel: 'Resolve & Verify',
      description: 'Crew on location actively cleaning and sanitizing',
    },
    {
      status: 'resolved',
      label: 'Resolved',
      nextLabel: 'Completed',
      description: 'Waste cleared, site disinfected, photos logged',
    },
  ];

  const handleNextStatus = (targetStatus?: ComplaintStatus) => {
    let next: ComplaintStatus = 'under_review';
    if (targetStatus) {
      next = targetStatus;
    } else {
      if (complaint.status === 'submitted') next = 'under_review';
      else if (complaint.status === 'under_review') next = 'assigned';
      else if (complaint.status === 'assigned') next = 'in_progress';
      else if (complaint.status === 'in_progress') next = 'resolved';
    }

    const note =
      adminNoteInput.trim() ||
      `Admin advanced status to ${next.replace('_', ' ').toUpperCase()}`;

    updateComplaintStatus(
      complaint.id,
      next,
      note,
      selectedWorkerId,
      next === 'resolved' ? afterPhotoUrl : undefined
    );

    setAdminNoteInput('');
  };

  const handleWorkerAssign = () => {
    assignComplaintWorker(
      complaint.id,
      selectedWorkerId,
      adminNoteInput.trim() || 'Assigned by Municipal Dispatch Controller'
    );
    setAdminNoteInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#14200C]/10 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#14200C]/08 flex items-start justify-between bg-[#14200C] text-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="font-mono font-bold text-[#DAE3B7] bg-white/10 px-2.5 py-0.5 rounded-md">
                {complaint.id}
              </span>
              <span className="text-white/40">·</span>
              <span className="font-semibold text-white/90">
                {complaint.category}
              </span>
              <span className="text-white/40">·</span>
              <span
                className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                  complaint.priority === 'Urgent'
                    ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                    : 'bg-white/10 text-white'
                }`}
              >
                {complaint.priority} Priority
              </span>
            </div>
            <h2 className="text-xl font-bold">{complaint.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#14200C]">
          {/* Quick Status Advancement Pipeline (Demo Step 4 Core) */}
          <div className="p-5 rounded-2xl bg-[#EEF0E4] border border-[#4A5F29]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A5F29]">
                  Municipal Workflow Controller
                </span>
                <p className="text-xs text-[#14200C]/75">
                  Current Status:{' '}
                  <strong className="text-[#14200C] uppercase tracking-wide">
                    {complaint.status.replace('_', ' ')}
                  </strong>
                </p>
              </div>

              {/* Status progression jump buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleNextStatus('under_review')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-smooth ${
                    complaint.status === 'under_review'
                      ? 'bg-[#4A5F29] text-white'
                      : 'bg-white text-[#14200C] hover:bg-[#DAE3B7]'
                  }`}
                >
                  1. Under Review
                </button>
                <button
                  onClick={() => handleNextStatus('assigned')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-smooth ${
                    complaint.status === 'assigned'
                      ? 'bg-[#4A5F29] text-white'
                      : 'bg-white text-[#14200C] hover:bg-[#DAE3B7]'
                  }`}
                >
                  2. Assign
                </button>
                <button
                  onClick={() => handleNextStatus('in_progress')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-smooth ${
                    complaint.status === 'in_progress'
                      ? 'bg-[#4A5F29] text-white'
                      : 'bg-white text-[#14200C] hover:bg-[#DAE3B7]'
                  }`}
                >
                  3. In Progress
                </button>
                <button
                  onClick={() => handleNextStatus('resolved')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-smooth ${
                    complaint.status === 'resolved'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-emerald-800 hover:bg-emerald-100 font-extrabold'
                  }`}
                >
                  4. Resolve
                </button>
              </div>
            </div>

            {/* Quick 1-click advance primary action */}
            {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
              <div className="pt-2 border-t border-[#4A5F29]/15 flex items-center justify-between">
                <span className="text-xs text-[#14200C]/80">
                  Advance to next stage in lifecycle:
                </span>
                <button
                  onClick={() => handleNextStatus()}
                  className="px-4 py-2 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-smooth"
                >
                  <span>
                    Advance: {complaint.status === 'submitted' ? 'Under Review' : complaint.status === 'under_review' ? 'Assigned' : complaint.status === 'assigned' ? 'In Progress' : 'Resolved'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Worker Assignment Section */}
          <div className="p-5 rounded-2xl bg-white border border-[#14200C]/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14200C] flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-[#4A5F29]" />
                <span>Sanitation Crew Assignment</span>
              </span>
              {complaint.assignedWorker && (
                <span className="text-xs font-bold text-[#4A5F29]">
                  Currently: {complaint.assignedWorker.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                {workers.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-[#F7F7F1] border border-[#14200C]/10 text-xs text-[#969691]">
                    No workers registered in Cloud Firestore yet.
                  </div>
                ) : (
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-xs font-medium text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.unit} ({w.zone}) · {w.assignedTasks} Active Tasks
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="button"
                onClick={handleWorkerAssign}
                disabled={workers.length === 0}
                className="px-4 py-2.5 rounded-xl bg-[#14200C] hover:bg-[#253916] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-smooth flex items-center justify-center gap-1.5"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Assign Worker</span>
              </button>
            </div>
          </div>

          {/* Admin Note Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
              Add Dispatch / Resolution Note to Audit Log
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="e.g. Dispatched waste compactor truck DL-01-MW-4022..."
                className="flex-1 px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-xs text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
              />
              <button
                type="button"
                onClick={() => {
                  if (adminNoteInput.trim()) {
                    handleNextStatus(complaint.status);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[#EEF0E4] hover:bg-[#DAE3B7] text-[#14200C] text-xs font-bold transition-colors"
              >
                Log Note
              </button>
            </div>
          </div>

          {/* Complaint Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F7F7F1] border border-[#14200C]/08 space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#969691] text-[10px]">
                Location & Citizen
              </span>
              <p className="font-bold text-[#14200C]">{complaint.location}</p>
              <p className="text-[#969691]">{complaint.addressDetails}</p>
              <p className="pt-1 text-[#14200C]">
                <strong>Citizen:</strong> {complaint.reporterName} ({complaint.reporterPhone || '+91 98111 22334'})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F1] border border-[#14200C]/08 space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#969691] text-[10px]">
                Description
              </span>
              <p className="text-[#14200C]/80 leading-relaxed">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#969691]">Citizen Before Photo</span>
              <div className="rounded-2xl overflow-hidden aspect-4/3 bg-[#F7F7F1] border border-[#14200C]/10">
                <img
                  src={complaint.beforePhotoUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#969691]">After Cleanup Clearance</span>
              <div className="rounded-2xl overflow-hidden aspect-4/3 bg-[#F7F7F1] border border-[#14200C]/10 flex items-center justify-center">
                {complaint.afterPhotoUrl ? (
                  <img
                    src={complaint.afterPhotoUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-6 h-6 text-[#969691] mx-auto mb-1" />
                    <p className="text-xs text-[#969691]">Attached when marked Resolved</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#969691]">
              Live Dispatch Event Trail
            </h4>
            <div className="space-y-2 border-l-2 border-[#4A5F29]/30 pl-4 ml-2">
              {complaint.timeline.map((event) => (
                <div key={event.id} className="relative space-y-0.5 text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#4A5F29]" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#14200C]">{event.title}</span>
                    <span className="text-[#969691]">·</span>
                    <span className="text-[#4A5F29] font-semibold">{event.actor}</span>
                    <span className="text-[10px] text-[#969691]">
                      ({new Date(event.timestamp).toLocaleTimeString()})
                    </span>
                  </div>
                  <p className="text-[#14200C]/75">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#14200C]/08 bg-[#F7F7F1] flex items-center justify-between">
          <span className="text-xs text-[#969691]">
            Official Municipal Command Desk
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#14200C]/15 text-xs font-semibold hover:bg-[#EEF0E4] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
