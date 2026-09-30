import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus } from '../../types';
import {
  X,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  ArrowRight,
  Phone,
  MessageSquare,
  AlertCircle,
  Star,
} from 'lucide-react';

interface Props {
  complaintId: string;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<Props> = ({
  complaintId,
  onClose,
}) => {
  const { complaints, role, updateComplaintStatus, showToast } = useApp();

  const complaint = complaints.find((c) => c.id === complaintId);

  const [citizenRating, setCitizenRating] = useState<number>(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  if (!complaint) return null;

  const steps: { key: ComplaintStatus; label: string; desc: string }[] = [
    { key: 'submitted', label: 'Submitted', desc: 'Complaint registered' },
    { key: 'under_review', label: 'Under Review', desc: 'Zonal triage' },
    { key: 'assigned', label: 'Assigned', desc: 'Worker dispatched' },
    { key: 'in_progress', label: 'In Progress', desc: 'Cleanup underway' },
    { key: 'resolved', label: 'Resolved', desc: 'Sanitized & verified' },
  ];

  const statusOrder: Record<ComplaintStatus, number> = {
    submitted: 0,
    under_review: 1,
    assigned: 2,
    in_progress: 3,
    resolved: 4,
    closed: 5,
  };

  const currentStepIndex = statusOrder[complaint.status] ?? 0;

  const handleConfirmResolution = () => {
    setFeedbackSubmitted(true);
    showToast('Thank you! Cleanup verified and citizen rating recorded.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-hero w-full max-w-3xl rounded-3xl shadow-2xl border border-white/60 dark:border-white/15 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-black/05 dark:border-white/10 flex items-start justify-between bg-white/40 dark:bg-black/20 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-[#DAE3B7]/50 dark:bg-[#4A5F29]/30 border border-white/60 dark:border-white/10 px-2.5 py-0.5 rounded-md">
                {complaint.id}
              </span>
              <span className="text-[#969691] dark:text-[#8E9B82]">·</span>
              <span className="font-semibold text-[#14200C] dark:text-[#F2F6ED]">{complaint.category}</span>
              <span className="text-[#969691] dark:text-[#8E9B82]">·</span>
              <span
                className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                  complaint.priority === 'Urgent'
                    ? 'bg-red-100 text-red-800'
                    : complaint.priority === 'High'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {complaint.priority} Priority
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#14200C] dark:text-[#F2F6ED]">
              {complaint.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/05 dark:hover:bg-white/10 text-[#14200C]/60 dark:text-[#F2F6ED]/70 hover:text-[#14200C] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#14200C] dark:text-[#F2F6ED]">
          {/* Visual Step Timeline matching Wireframe */}
          <div className="glass-card-subtle p-5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#969691] mb-4">
              Complaint Progress Lifecycle
            </h3>

            {/* Stepper Bar */}
            <div className="grid grid-cols-5 gap-2 relative">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-smooth mb-2 ${
                        isCompleted
                          ? 'bg-[#4A5F29] text-white'
                          : 'bg-white text-[#969691] border border-[#14200C]/20'
                      } ${isCurrent ? 'ring-4 ring-[#DAE3B7]' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isCompleted ? 'text-[#14200C]' : 'text-[#969691]'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-[#969691] hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#14200C]/08 bg-white space-y-2">
              <span className="text-xs font-semibold text-[#969691] uppercase tracking-wider">
                Location Coordinates
              </span>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#4A5F29] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#14200C]">{complaint.location}</p>
                  <p className="text-xs text-[#969691] mt-0.5">{complaint.addressDetails}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#14200C]/08 bg-white space-y-2">
              <span className="text-xs font-semibold text-[#969691] uppercase tracking-wider">
                Reporter & Timestamps
              </span>
              <div className="space-y-1 text-xs">
                <p>
                  <strong className="text-[#14200C]">Filed by:</strong> {complaint.reporterName}
                </p>
                <p>
                  <strong className="text-[#14200C]">Lodged on:</strong>{' '}
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong className="text-[#14200C]">Last update:</strong>{' '}
                  {new Date(complaint.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Worker Contact Card if assigned */}
          {complaint.assignedWorker && (
            <div className="p-4 rounded-2xl border border-[#4A5F29]/20 bg-[#EEF0E4]/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4A5F29] text-white flex items-center justify-center font-bold">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A5F29]">
                    Assigned Sanitation Specialist
                  </span>
                  <p className="font-bold text-[#14200C]">{complaint.assignedWorker.name}</p>
                  <p className="text-xs text-[#969691]">{complaint.assignedWorker.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${complaint.assignedWorker.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#14200C]/15 text-xs font-semibold text-[#14200C] flex items-center gap-1.5 hover:bg-[#F7F7F1]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4A5F29]" />
                  <span>Call Crew</span>
                </a>
              </div>
            </div>
          )}

          {/* Photo Evidence Comparison (Before and After) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#969691]">
              Photo Verification Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#969691]">Before Inspection</span>
                <div className="rounded-2xl overflow-hidden border border-[#14200C]/10 aspect-4/3 bg-[#F7F7F1]">
                  {complaint.beforePhotoUrl ? (
                    <img
                      src={complaint.beforePhotoUrl}
                      alt="Before cleanup"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#969691]">
                      No photo submitted
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#969691]">After Cleanup Clearance</span>
                <div className="rounded-2xl overflow-hidden border border-[#14200C]/10 aspect-4/3 bg-[#F7F7F1] flex items-center justify-center">
                  {complaint.afterPhotoUrl ? (
                    <img
                      src={complaint.afterPhotoUrl}
                      alt="After cleanup clearance"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-xs font-semibold text-[#969691]">Pending Worker Verification</p>
                      <p className="text-[10px] text-[#969691] mt-1">Photo captured upon task completion</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Timeline Log */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#969691]">
              Audit Trail & Timeline Events
            </h3>

            <div className="space-y-3 border-l-2 border-[#4A5F29]/30 pl-4 ml-2">
              {complaint.timeline.map((event) => (
                <div key={event.id} className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#4A5F29]" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#14200C]">{event.title}</span>
                    <span className="text-[11px] text-[#969691]">·</span>
                    <span className="text-[11px] text-[#4A5F29] font-medium">{event.actor}</span>
                    <span className="text-[10px] text-[#969691]">
                      ({new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                  <p className="text-xs text-[#14200C]/75">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback if resolved */}
          {complaint.status === 'resolved' && (
            <div className="p-4 rounded-2xl bg-[#EEF0E4] border border-[#4A5F29]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A5F29]">
                <ShieldCheck className="w-4 h-4" />
                <span>Citizen Verification & Confirmation</span>
              </div>
              <p className="text-xs text-[#14200C]/80">
                Municipal crews marked this area as clean and sanitized. Please confirm the site status.
              </p>

              {feedbackSubmitted || complaint.citizenFeedback?.confirmed ? (
                <div className="p-2.5 bg-white rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Citizen confirmed resolution. Rated 5/5 stars!</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmResolution}
                    className="px-4 py-2 rounded-xl bg-[#4A5F29] text-white text-xs font-bold hover:bg-[#3d4f21] transition-smooth"
                  >
                    Confirm Resolution
                  </button>
                  <span className="text-xs text-[#969691]">or report remaining litter</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#14200C]/08 bg-[#F7F7F1] flex items-center justify-between">
          <span className="text-xs text-[#969691]">
            Encrypted civic audit log · Ward 24
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
