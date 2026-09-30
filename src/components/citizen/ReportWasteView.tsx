import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import { MUNICIPAL_AREAS } from '../../data/mockData';
import {
  Upload,
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  SwitchCamera,
  X,
  RefreshCw,
  Image as ImageIcon,
  Trash2,
  FileImage,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReportWasteView: React.FC = () => {
  const { createComplaint, setActiveTab, setSelectedComplaintId, currentUser } = useApp();

  const [category, setCategory] = useState<ComplaintCategory>('Overflowing Bin');
  const [location, setLocation] = useState<string>(currentUser.area || 'College Road');
  const [addressDetails, setAddressDetails] = useState<string>(
    currentUser.address ? `Near ${currentUser.address}` : 'Near Main Junction, College Road'
  );
  const [priority, setPriority] = useState<ComplaintPriority>('Urgent');
  const [description, setDescription] = useState<string>(
    'Public municipal bin is overflowing onto the pedestrian footpath. Litter is scattered across the pavement and blocking the walking path.'
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'
  );
  const [photoSource, setPhotoSource] = useState<'camera' | 'upload' | 'preset'>('preset');
  const [aiTriageDone, setAiTriageDone] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Live Camera and File Upload States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isSimulatedStream, setIsSimulatedStream] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<string>('📍 28.6139° N, 77.2090° E');
  const [hasCustomPhoto, setHasCustomPhoto] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const simulatedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Callback ref for video element to ensure stream attaches even if element renders after stream ready
  const setVideoElementRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch(() => {});
    }
  }, []);

  // Read real browser geolocation if permitted
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoordinates(
            `📍 ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`
          );
        },
        () => {}
      );
    }
  }, []);

  // Animated Simulated Live Camera Viewfinder Loop
  useEffect(() => {
    if (!isCameraActive || !isSimulatedStream) return;

    let animId: number;
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src =
      cameraFacing === 'environment'
        ? 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1280&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1280&q=80';

    const startTime = Date.now();

    const render = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width || 1280;
      const h = canvas.height || 720;
      const elapsed = (Date.now() - startTime) / 1000;

      // Realistic handheld micro-movement
      if (baseImg.complete && baseImg.naturalWidth > 0) {
        const shakeX = Math.sin(elapsed * 1.6) * 4;
        const shakeY = Math.cos(elapsed * 1.3) * 3;
        ctx.save();
        ctx.drawImage(baseImg, -10 + shakeX, -10 + shakeY, w + 20, h + 20);
        ctx.restore();
      } else {
        ctx.fillStyle = '#14200C';
        ctx.fillRect(0, 0, w, h);
      }

      // Draw simulated live scanner laser band
      const scanY = ((Math.sin(elapsed * 2.2) + 1) / 2) * h;
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, 'rgba(74, 95, 41, 0)');
      grad.addColorStop(0.5, 'rgba(114, 139, 60, 0.35)');
      grad.addColorStop(1, 'rgba(74, 95, 41, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, w, 40);

      // Center scanline
      ctx.strokeStyle = 'rgba(218, 227, 183, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.12, scanY);
      ctx.lineTo(w * 0.88, scanY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isCameraActive, isSimulatedStream, cameraFacing]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing, forceSimulated = false) => {
    setCameraError(null);
    setIsCameraActive(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (forceSimulated) {
      setIsSimulatedStream(true);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC Camera not supported or restricted by browser sandbox.');
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
      setIsSimulatedStream(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Hardware camera access blocked or unavailable in this environment:', err);
      // Rather than halting, seamlessly provide the interactive live camera viewfinder in sandbox mode
      setIsSimulatedStream(true);
      setIsCameraActive(true);
      setCameraError('Webcam access was restricted by your browser. Running interactive live camera in sandbox mode — tap shutter to capture or choose device camera.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsSimulatedStream(false);
  };

  const toggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    if (!isSimulatedStream) {
      startCamera(next);
    }
  };

  const capturePhoto = () => {
    setIsCapturing(true);
    setShutterFlash(true);

    setTimeout(() => {
      setShutterFlash(false);
    }, 200);

    try {
      let dataUrl: string | null = null;

      if (isSimulatedStream && simulatedCanvasRef.current) {
        dataUrl = simulatedCanvasRef.current.toDataURL('image/jpeg', 0.90);
      } else if (videoRef.current) {
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
          dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        }
      }

      if (dataUrl) {
        setPhotoUrl(dataUrl);
        setPhotoSource('camera');
        setHasCustomPhoto(true);
        setAiTriageDone(true);
        setCameraError(null);
        stopCamera();
      }
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoSource('upload');
        setHasCustomPhoto(true);
        setAiTriageDone(true);
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    stopCamera();
    setPhotoUrl('');
    setHasCustomPhoto(false);
  };

  const categories: ComplaintCategory[] = [
    'Overflowing Bin',
    'Illegal Dumping',
    'Broken Bin',
    'Hazardous Waste',
    'Bio-Waste',
    'Uncollected Garbage',
    'Other',
  ];

  const priorities: { value: ComplaintPriority; label: string; desc: string; color: string }[] = [
    { value: 'Low', label: 'Low', desc: 'Routine pickup / Minor debris', color: 'border-slate-200 text-slate-700 bg-slate-50' },
    { value: 'Medium', label: 'Medium', desc: 'Standard turnaround within 24h', color: 'border-amber-200 text-amber-700 bg-amber-50' },
    { value: 'High', label: 'High', desc: 'Heavily littered / public nuisance', color: 'border-orange-200 text-orange-700 bg-orange-50' },
    { value: 'Urgent', label: 'Urgent', desc: 'Blocked road, health hazard, immediate dispatch', color: 'border-red-300 text-red-800 bg-red-50' },
  ];

  // Quick fill preset for exact demo scenario
  const handleQuickDemoPreset = () => {
    setCategory('Overflowing Bin');
    setLocation('College Road');
    setPriority('Urgent');
    setAddressDetails('Opposite Engineering College Library, College Road');
    setDescription(
      'Municipal garbage bin is completely full and spilling over the walkway. Needs immediate sanitation truck clearance.'
    );
    setPhotoUrl('https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80');
    setAiTriageDone(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !location) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newComplaint = createComplaint({
        title: `${category} at ${location}`,
        category,
        location,
        addressDetails,
        priority,
        description,
        beforePhotoUrl: photoUrl,
      });

      setIsSubmitting(false);
      setSubmittedTicketId(newComplaint.id);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#4A5F29', '#DAE3B7', '#728B3C', '#14200C'],
        });
      } catch {
        // graceful ignore
      }
    }, 400);
  };

  if (submittedTicketId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="glass-hero rounded-3xl p-8 md:p-10 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#DAE3B7] text-[#4A5F29] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-[#4A5F29] dark:text-[#DAE3B7] bg-[#DAE3B7]/50 dark:bg-[#4A5F29]/30 border border-white/60 dark:border-white/10 px-3 py-1 rounded-full shadow-2xs">
            Civic Dispatch Alert Created
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#14200C] dark:text-[#F2F6ED] mt-3">
            Report submitted successfully.
          </h2>

          <p className="text-sm text-[#969691] dark:text-[#8E9B82] mt-2">
            Your complaint has been queued in the municipal ward triage desk.
          </p>

          <div className="my-6 p-4 rounded-2xl glass-card-subtle max-w-sm mx-auto">
            <p className="text-xs text-[#969691] dark:text-[#8E9B82] uppercase tracking-wider font-semibold">
              Official Tracking ID
            </p>
            <p className="text-2xl font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] mt-1">
              {submittedTicketId}
            </p>
            <div className="mt-2 text-xs text-[#14200C]/80 dark:text-[#F2F6ED]/80 flex items-center justify-center gap-2">
              <span className="font-semibold">{location}</span>
              <span>·</span>
              <span className="text-red-700 dark:text-red-400 font-bold">{priority} Priority</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedComplaintId(submittedTicketId);
                setActiveTab('my-complaints');
              }}
              className="glass-button-primary w-full sm:w-auto px-6 py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>Track Ticket Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSubmittedTicketId(null);
                handleQuickDemoPreset();
              }}
              className="glass-button-secondary w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header with Quick Preset Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#14200C]/08">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#14200C] tracking-tight">
            Report Waste Issue
          </h1>
          <p className="text-xs md:text-sm text-[#969691] mt-1">
            Submit photos and coordinates to dispatch municipal cleaning crews.
          </p>
        </div>

        {/* 1-Click Demo Shortcut matching prompt requirements */}
        <button
          type="button"
          onClick={handleQuickDemoPreset}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#DAE3B7]/80 hover:bg-[#DAE3B7] text-[#14200C] text-xs font-semibold border border-[#4A5F29]/20 transition-smooth shadow-2xs self-start"
          title="Autofill Overflowing Bin at College Road (Urgent)"
        >
          <Zap className="w-3.5 h-3.5 text-[#4A5F29]" />
          <span>Quick Demo: Overflowing Bin @ College Rd</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 space-y-6 glass-card-primary p-6 md:p-8 rounded-3xl">
          {/* Issue Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
              Issue Category <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-smooth ${
                    category === cat
                      ? 'border-[#4A5F29] bg-[#EEF0E4] text-[#4A5F29] font-bold shadow-2xs'
                      : 'border-[#14200C]/10 hover:border-[#14200C]/30 text-[#14200C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location Area Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                Location Area <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] text-[#4A5F29] font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> GPS Pin Auto-Verified
              </span>
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm font-medium text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
            >
              {MUNICIPAL_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Street Address / Landmark */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
              Street Landmark / Details
            </label>
            <input
              type="text"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder="e.g. Opposite Main Gate, near electrical pole #12"
              className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
            />
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
              Priority Level <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`p-3 rounded-xl border text-left transition-smooth flex flex-col justify-between ${
                    priority === p.value
                      ? 'border-[#4A5F29] ring-2 ring-[#4A5F29]/20 bg-[#EEF0E4]'
                      : 'border-[#14200C]/10 hover:border-[#14200C]/30 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14200C]">{p.label}</span>
                    {priority === p.value && (
                      <span className="w-2 h-2 rounded-full bg-[#4A5F29]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#969691] mt-1 leading-tight line-clamp-2">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
              Issue Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste situation, volume, or obstacles..."
              className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
            />
          </div>
        </div>

        {/* Right Col: Photo Upload & AI Triage Simulator */}
        <div className="space-y-6">
          {/* Photo Card */}
          <div className="glass-card-primary p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                <span>Photo Evidence</span>
              </span>
              <span className="text-[11px] text-[#4A5F29] dark:text-[#DAE3B7] font-semibold bg-[#EEF0E4] dark:bg-[#202D1A] px-2 py-0.5 rounded-full border border-[#14200C]/10 dark:border-[#DAE3B7]/15">
                Geo-tagged
              </span>
            </div>

            {/* Error Notification Banner if camera is denied/unavailable */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                    {cameraError}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-[#4A5F29] text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs hover:bg-[#3d4f21] cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Take Photo with Phone Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202D1A] border border-amber-300 dark:border-amber-700 font-bold text-[11px] text-amber-900 dark:text-amber-100 inline-flex items-center gap-1 hover:bg-amber-100/50 cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-[#4A5F29] dark:text-[#DAE3B7]" />
                      <span>Choose Image File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraError(null)}
                      className="text-[11px] text-amber-700 dark:text-amber-300 underline font-medium hover:no-underline ml-auto cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Area (Live Camera Viewfinder OR Image Preview OR Drag-and-Drop Zone) */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#4A5F29] dark:border-[#DAE3B7] aspect-4/3 bg-black shadow-inner">
                {isSimulatedStream ? (
                  <canvas
                    ref={simulatedCanvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={setVideoElementRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                  />
                )}

                {/* Shutter Flash Animation */}
                {shutterFlash && (
                  <div className="absolute inset-0 bg-white z-20 animate-out fade-out duration-200 pointer-events-none" />
                )}

                {/* Viewfinder Overlay HUD */}
                <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between z-10">
                  {/* Top Bar HUD */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-bold tracking-wider uppercase shadow-md animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>{isSimulatedStream ? 'Sandbox Live Camera' : 'Live Camera Active'}</span>
                    </div>

                    <div className="text-[10px] font-mono text-white/95 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md shadow-xs">
                      {gpsCoordinates}
                    </div>
                  </div>

                  {/* Center Target Reticle */}
                  <div className="self-center w-40 h-40 border-2 border-white/40 rounded-2xl relative flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-white absolute -top-0.5 -left-0.5" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white absolute -top-0.5 -right-0.5" />
                    <div className="w-4 h-4 border-b-2 border-l-2 border-white absolute -bottom-0.5 -left-0.5" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-white absolute -bottom-0.5 -right-0.5" />
                    <span className="text-[10px] text-white/90 font-bold tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded">
                      FRAME WASTE SITE
                    </span>
                  </div>

                  {/* Bottom hint */}
                  <div className="text-center text-[10px] text-white/95 bg-black/60 py-1 px-3 rounded-lg backdrop-blur-md mx-auto">
                    Point camera at issue & tap the shutter button below
                  </div>
                </div>

                {/* Live Camera Action Controls */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 pointer-events-auto z-10">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 border border-white/20"
                    title="Switch Front/Rear Camera"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>

                  {/* Big Circular Capture Shutter */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-90 transition-all flex items-center justify-center shadow-2xl group cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-11 h-11 rounded-full bg-white group-hover:scale-95 transition-transform flex items-center justify-center">
                      <Camera className="w-6 h-6 text-red-600" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 border border-white/20"
                    title="Close Camera"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/60 dark:border-white/15 aspect-4/3 bg-black/5 group shadow-sm">
                <img
                  src={photoUrl}
                  alt="Waste report preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />

                {/* Top Source Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold shadow-md">
                    {photoSource === 'camera' ? (
                      <>
                        <Camera className="w-3 h-3 text-emerald-400" />
                        <span>Live Camera Snapshot</span>
                      </>
                    ) : photoSource === 'upload' ? (
                      <>
                        <Upload className="w-3 h-3 text-blue-400" />
                        <span>Uploaded File</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Evidence Photo</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Permanent Action Dock directly on preview */}
                <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Live Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 rounded-xl bg-black/75 hover:bg-red-900/80 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {/* GPS Geo-Tag Watermark Badge */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md flex items-center justify-between">
                  <span className="font-mono">{gpsCoordinates}</span>
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified GPS
                  </span>
                </div>
              </div>
            ) : (
              /* Dropzone when no photo is set */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed aspect-4/3 flex flex-col items-center justify-center p-6 text-center transition-all ${
                  isDragging
                    ? 'border-[#4A5F29] bg-[#EEF0E4]/60 dark:bg-[#202D1A]/60 scale-101'
                    : 'border-[#14200C]/20 dark:border-white/20 bg-white/40 dark:bg-black/20 hover:border-[#4A5F29]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF0E4] dark:bg-[#202D1A] text-[#4A5F29] dark:text-[#DAE3B7] flex items-center justify-center shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                </div>

                <p className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1">
                  Take a photo or upload from device
                </p>
                <p className="text-[11px] text-[#969691] dark:text-[#8E9B82] max-w-xs mb-4">
                  Drag & drop an image here or choose one of the options below
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-white dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-[#DAE3B7]/25 hover:border-[#4A5F29] text-[#14200C] dark:text-[#F2F6ED] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Prominent Dual Action Buttons under media box */}
            {!isCameraActive && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="py-2.5 px-3 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#DAE3B7]" />
                  <span>{photoUrl ? 'Retake with Camera' : 'Open Live Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-[#DAE3B7]/25 hover:border-[#4A5F29] text-[#14200C] dark:text-[#F2F6ED] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#4A5F29] dark:text-[#DAE3B7]" />
                  <span>{photoUrl ? 'Change Image File' : 'Upload Image File'}</span>
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Hidden native device camera capture input */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* AI Triage verification box matching wireframe */}
            {aiTriageDone && (
              <div className="p-3.5 rounded-2xl glass-card-subtle space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5F29] dark:text-[#DAE3B7]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Triage & Classification</span>
                </div>
                <div className="text-[11px] space-y-1 text-[#14200C]/85 dark:text-[#F2F6ED]/85 font-medium">
                  <p>
                    <strong className="text-[#14200C] dark:text-[#F2F6ED]">Detection:</strong> {category} spilling on footpath
                  </p>
                  <p>
                    <strong className="text-[#14200C] dark:text-[#F2F6ED]">Confidence:</strong> 96% Match
                  </p>
                  <p>
                    <strong className="text-[#14200C] dark:text-[#F2F6ED]">Recommended Priority:</strong>{' '}
                    <span className="text-red-700 dark:text-red-400 font-bold uppercase">{priority}</span>
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button-primary w-full py-3.5 px-6 rounded-full text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Ticket...</span>
                </>
              ) : (
                <>
                  <span>Submit Waste Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
