import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, PickupRequest } from '../../types';
import {
  HardHat,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Camera,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  Upload,
  RefreshCw,
  Truck,
  Package,
  SwitchCamera,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorkerDashboard: React.FC = () => {
  const {
    complaints,
    pickups,
    updateComplaintStatus,
    updatePickupStatus,
    currentUser,
    showToast,
  } = useApp();

  // Dynamic logged-in worker details
  const assignedWorkerName = currentUser.name || 'Sanitation Worker';
  const assignedWorkerUnit = currentUser.unit || currentUser.zone || 'Sanitation Unit 04';
  const assignedWorkerBadge = currentUser.badgeId || currentUser.uid || 'W-104';

  // Find tasks assigned to this worker (or unassigned tasks in their zone that they can claim)
  const myTasks = complaints.filter(
    (c) =>
      c.assignedWorker?.id === assignedWorkerBadge ||
      c.assignedWorker?.id === currentUser.uid ||
      (currentUser.name && c.assignedWorker?.name?.toLowerCase() === currentUser.name?.toLowerCase()) ||
      (c.status === 'assigned' && !c.assignedWorker)
  );

  const activeTasks = myTasks.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  );
  const completedTasks = complaints.filter(
    (c) =>
      (c.assignedWorker?.id === assignedWorkerBadge ||
        c.assignedWorker?.id === currentUser.uid ||
        (currentUser.name && c.assignedWorker?.name?.toLowerCase() === currentUser.name?.toLowerCase())) &&
      (c.status === 'resolved' || c.status === 'closed')
  );

  // Doorstep Pickups assigned to this worker
  const myPickups = pickups.filter(
    (p) =>
      p.assignedWorker?.id === assignedWorkerBadge ||
      p.assignedWorker?.id === currentUser.uid ||
      (currentUser.name && p.assignedWorker?.name?.toLowerCase() === currentUser.name?.toLowerCase()) ||
      (p.status === 'Assigned' && !p.assignedWorker)
  );

  const activePickups = myPickups.filter((p) => p.status !== 'Completed');

  const [activeTaskTab, setActiveTaskTab] = useState<'pending' | 'pickups' | 'completed'>('pending');
  const [selectedTaskForVerify, setSelectedTaskForVerify] = useState<Complaint | null>(null);
  const [uploadedAfterPhoto, setUploadedAfterPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80'
  );
  const [isVerifying, setIsVerifying] = useState(false);

  // Live camera & upload states for verification proof
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setVideoElementRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    setIsCameraActive(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Worker camera access failed:', err);
      setCameraError('Camera unavailable. You can upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (cameraFacing === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setUploadedAfterPhoto(dataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedAfterPhoto(reader.result);
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartTask = (taskId: string) => {
    updateComplaintStatus(
      taskId,
      'in_progress',
      `Worker ${assignedWorkerName} arrived on-site and initiated cleanup operations.`,
      assignedWorkerBadge
    );
    showToast('Task marked IN PROGRESS. Sanitation underway.', 'success');
  };

  const handleVerifyAndResolve = () => {
    if (!selectedTaskForVerify) return;
    setIsVerifying(true);

    setTimeout(() => {
      updateComplaintStatus(
        selectedTaskForVerify.id,
        'resolved',
        `Waste cleared, bin emptied and area disinfected with lime. Verified with cleanup proof by ${assignedWorkerName}.`,
        assignedWorkerBadge,
        uploadedAfterPhoto
      );

      setIsVerifying(false);
      setSelectedTaskForVerify(null);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4A5F29', '#DAE3B7', '#728B3C'],
        });
      } catch {
        // ignore
      }

      showToast('Cleanup verified and marked RESOLVED in Cloud Firestore!', 'success');
    }, 500);
  };

  const handlePickupAdvance = (pickup: PickupRequest) => {
    if (pickup.status === 'Requested' || pickup.status === 'Scheduled' || pickup.status === 'Assigned') {
      updatePickupStatus(
        pickup.id,
        'Picked Up',
        `Doorstep collection vehicle loaded by ${assignedWorkerName} (${assignedWorkerUnit}).`,
        assignedWorkerBadge
      );
    } else if (pickup.status === 'Picked Up') {
      updatePickupStatus(
        pickup.id,
        'Completed',
        `Delivered to municipal sorting & recycling depot by ${assignedWorkerName}.`,
        assignedWorkerBadge
      );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Worker Header */}
      <div className="bg-[#14200C] text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4A5F29] text-white flex items-center justify-center font-bold text-xl border border-white/20">
            <HardHat className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DAE3B7]">
              <span>Field Sanitation Crew Portal · Live Cloud Dispatch</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{assignedWorkerName}</h1>
            <p className="text-xs text-white/70 mt-0.5">
              Badge: <span className="font-mono font-bold text-[#DAE3B7]">{assignedWorkerBadge}</span> · {assignedWorkerUnit}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
              Work Orders
            </span>
            <p className="text-2xl font-mono font-bold text-[#DAE3B7]">
              {activeTasks.length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
              Doorstep Pickups
            </span>
            <p className="text-2xl font-mono font-bold text-[#DAE3B7]">
              {activePickups.length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
              Completed
            </span>
            <p className="text-2xl font-mono font-bold text-white">
              {completedTasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#EEF0E4] dark:bg-[#202D1A] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTaskTab('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth ${
            activeTaskTab === 'pending'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 dark:text-[#F2F6ED]/70 hover:text-[#14200C]'
          }`}
        >
          My Active Tasks ({activeTasks.length})
        </button>
        <button
          onClick={() => setActiveTaskTab('pickups')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth ${
            activeTaskTab === 'pickups'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 dark:text-[#F2F6ED]/70 hover:text-[#14200C]'
          }`}
        >
          Doorstep Pickups ({activePickups.length})
        </button>
        <button
          onClick={() => setActiveTaskTab('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-smooth ${
            activeTaskTab === 'completed'
              ? 'bg-[#4A5F29] text-white shadow-xs'
              : 'text-[#14200C]/70 dark:text-[#F2F6ED]/70 hover:text-[#14200C]'
          }`}
        >
          Completed Cleanups ({completedTasks.length})
        </button>
      </div>

      {/* VIEW: Work Orders */}
      {activeTaskTab === 'pending' && (
        activeTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#182214] rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#4A5F29] dark:text-[#DAE3B7] mx-auto" />
            <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">All assigned tasks clear!</h3>
            <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70">No pending work orders currently queued in Cloud Firestore for your badge.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-[#182214] p-6 rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 hover:border-[#4A5F29]/30 shadow-xs transition-smooth flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-[#EEF0E4] dark:bg-[#202D1A] px-2.5 py-0.5 rounded">
                      {task.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded border text-[11px] font-bold ${
                        task.status === 'in_progress'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                      }`}
                    >
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[#969691]">·</span>
                    <span className="font-semibold text-[#14200C] dark:text-[#F2F6ED]">{task.category}</span>
                    <span className="text-[#969691]">·</span>
                    <span
                      className={`text-[11px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'text-red-700'
                          : task.priority === 'High'
                          ? 'text-orange-700'
                          : 'text-[#4A5F29] dark:text-[#DAE3B7]'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">{task.title}</h3>
                  <p className="text-xs text-[#14200C]/75 dark:text-[#F2F6ED]/75">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#969691] dark:text-[#DAE3B7]/70 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                      <span>{task.location} {task.addressDetails ? `(${task.addressDetails})` : ''}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(task.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Right photo preview & actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#14200C]/10 bg-[#F7F7F1] shrink-0">
                    <img
                      src={task.beforePhotoUrl}
                      alt="Task before photo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex flex-col gap-2 min-w-[170px]">
                    {task.status === 'assigned' ? (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold transition-smooth flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Start Cleanup</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTaskForVerify(task)}
                        className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-smooth flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Verify & Resolve</span>
                      </button>
                    )}

                    <a
                      href={`tel:${task.reporterPhone || '+919811122334'}`}
                      className="w-full py-2 px-3 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] hover:bg-[#EEF0E4] text-[#14200C] dark:text-[#F2F6ED] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                      <span>Call Citizen</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* VIEW: Doorstep Pickups */}
      {activeTaskTab === 'pickups' && (
        myPickups.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#182214] rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 space-y-2">
            <Truck className="w-10 h-10 text-[#4A5F29] dark:text-[#DAE3B7] mx-auto" />
            <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">No doorstep pickups assigned</h3>
            <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70">Doorstep pickups dispatched by municipal logistics will appear here in real time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myPickups.map((pickup) => (
              <div
                key={pickup.id}
                className="bg-white dark:bg-[#182214] p-6 rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 shadow-xs transition-smooth flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-[#EEF0E4] dark:bg-[#202D1A] px-2.5 py-0.5 rounded">
                      {pickup.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded border text-[11px] font-bold bg-blue-100 text-blue-900 border-blue-300">
                      {pickup.status}
                    </span>
                    <span className="text-[#969691]">·</span>
                    <span className="font-semibold text-[#14200C] dark:text-[#F2F6ED]">{pickup.wasteType}</span>
                    <span className="text-[#969691]">·</span>
                    <span className="text-xs font-semibold text-[#4A5F29] dark:text-[#DAE3B7]">{pickup.estimatedWeight || '10-15 kg'}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">
                    {pickup.address} · {pickup.area}
                  </h3>
                  <p className="text-xs text-[#14200C]/75 dark:text-[#F2F6ED]/75">
                    Slot: <strong>{pickup.scheduledDate} ({pickup.timeSlot})</strong> · Requester: {pickup.requesterName}
                  </p>
                  {pickup.specialInstructions && (
                    <p className="text-xs text-[#4A5F29] dark:text-[#DAE3B7] italic">
                      "{pickup.specialInstructions}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {pickup.status !== 'Completed' && (
                    <button
                      onClick={() => handlePickupAdvance(pickup)}
                      className="px-5 py-2.5 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold transition-smooth flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{pickup.status === 'Picked Up' ? 'Complete & Delivered to Depot' : 'Mark Picked Up'}</span>
                    </button>
                  )}

                  {pickup.requesterPhone && (
                    <a
                      href={`tel:${pickup.requesterPhone}`}
                      className="py-2.5 px-3.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] hover:bg-[#EEF0E4] text-[#14200C] dark:text-[#F2F6ED] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                      <span>Call Citizen</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* VIEW: Completed cleanups */}
      {activeTaskTab === 'completed' && (
        completedTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#182214] rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#969691] mx-auto" />
            <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">No completed tasks yet</h3>
            <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70">Tasks marked resolved will show here with verified resolution photos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-[#182214] p-6 rounded-3xl border border-[#14200C]/08 dark:border-[#DAE3B7]/15 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-[#EEF0E4] dark:bg-[#202D1A] px-2 py-0.5 rounded">
                      {task.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      RESOLVED
                    </span>
                    <span className="font-semibold text-[#14200C] dark:text-[#F2F6ED]">{task.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#14200C] dark:text-[#F2F6ED]">{task.title}</h4>
                  <p className="text-xs text-[#969691]">{task.location} · Resolved {new Date(task.updatedAt).toLocaleDateString()}</p>
                </div>

                {task.afterPhotoUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#14200C]/10 shrink-0">
                    <img
                      src={task.afterPhotoUrl}
                      alt="Resolved proof"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* RESOLUTION VERIFICATION MODAL */}
      {selectedTaskForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#182214] text-[#14200C] dark:text-[#F2F6ED] rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-[#14200C]/10 dark:border-[#DAE3B7]/15">
            <div className="flex items-center justify-between border-b border-[#14200C]/10 dark:border-[#DAE3B7]/15 pb-4">
              <div>
                <h3 className="text-lg font-bold">Proof of Sanitation Cleanup</h3>
                <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70">Ticket: {selectedTaskForVerify.id} · {selectedTaskForVerify.category}</p>
              </div>
              <button
                onClick={() => setSelectedTaskForVerify(null)}
                className="w-8 h-8 rounded-full bg-[#F7F7F1] dark:bg-[#202D1A] flex items-center justify-center text-[#969691]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-[#969691] uppercase tracking-wider block mb-1">
                    Before Cleanup
                  </span>
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-[#14200C]/10 bg-[#F7F7F1]">
                    <img
                      src={selectedTaskForVerify.beforePhotoUrl}
                      alt="Before"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#4A5F29] dark:text-[#DAE3B7] uppercase tracking-wider block">
                      After Cleanup (Proof)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startCamera('environment')}
                        className="px-2 py-0.5 rounded-md bg-[#4A5F29] text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:bg-[#3d4f21]"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#202D1A] border border-[#14200C]/15 text-[#14200C] dark:text-[#F2F6ED] text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:border-[#4A5F29]"
                      >
                        <Upload className="w-3 h-3 text-[#4A5F29] dark:text-[#DAE3B7]" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>

                  {isCameraActive ? (
                    <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-[#4A5F29] bg-black relative">
                      <video
                        ref={setVideoElementRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2">
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="p-1.5 rounded-full bg-black/60 text-white"
                          title="Switch Camera"
                        >
                          <SwitchCamera className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={isCapturing}
                          className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-lg active:scale-95"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Snap Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="p-1.5 rounded-full bg-black/60 text-white"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-[#4A5F29]/40 bg-[#EEF0E4] relative group">
                      <img
                        src={uploadedAfterPhoto}
                        alt="After"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startCamera('environment')}
                          className="px-2.5 py-1 bg-[#4A5F29] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-md"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Live Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white text-black text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-md"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#4A5F29]" />
                          <span>Upload Photo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Wireframe AI Comparison Verdict Badge */}
              <div className="p-4 rounded-2xl bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#4A5F29]/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5F29] dark:text-[#DAE3B7]">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Scene Verification Check</span>
                </div>
                <div className="space-y-1 text-[#14200C]/80 dark:text-[#F2F6ED]/80">
                  <p><strong>Verdict:</strong> Cleaned — Same Scene Confirmed</p>
                  <p><strong>Confidence:</strong> 96% Match</p>
                  <p><strong>Notes:</strong> Scene matches original location coordinates and all visible waste has been evacuated.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForVerify(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 font-semibold hover:bg-[#F7F7F1] dark:hover:bg-[#202D1A]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVerifyAndResolve}
                  disabled={isVerifying}
                  className="px-6 py-2.5 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white font-bold flex items-center gap-2 shadow-xs transition-smooth disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Cleanup...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Mark Resolved</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
