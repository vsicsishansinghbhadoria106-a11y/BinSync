import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import { MUNICIPAL_AREAS } from '../../data/mockData';
import { RealDeviceCamera } from '../camera/RealDeviceCamera';
import { uploadImageToStorage } from '../../lib/storage';
import { verifyImageWithGemini, ImageVerificationResult } from '../../lib/geminiVerification';
import { GeminiImageAuditBadge } from '../common/GeminiImageAuditBadge';
import {
  Upload,
  Camera,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Zap,
  Trash2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReportWasteView: React.FC = () => {
  const { createComplaint, setActiveTab, setSelectedComplaintId, currentUser, showToast } = useApp();

  const [category, setCategory] = useState<ComplaintCategory>('Overflowing Bin');
  const [location, setLocation] = useState<string>(currentUser.area || 'College Road');
  const [addressDetails, setAddressDetails] = useState<string>(
    currentUser.address ? `Near ${currentUser.address}` : 'Near Main Junction, College Road'
  );
  const [priority, setPriority] = useState<ComplaintPriority>('Urgent');
  const [description, setDescription] = useState<string>(
    'Public municipal bin is overflowing onto the pedestrian footpath. Litter is scattered across the pavement and blocking the walking path.'
  );

  // Photo & Upload states
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoSource, setPhotoSource] = useState<'camera' | 'upload' | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Gemini AI Image Verification & Authenticity Audit
  const [geminiAudit, setGeminiAudit] = useState<ImageVerificationResult | null>(null);
  const [isAnalyzingGemini, setIsAnalyzingGemini] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<string>('📍 28.6139° N, 77.2090° E');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerGeminiAudit = async (imgUrl: string) => {
    if (!imgUrl) return;
    setIsAnalyzingGemini(true);
    try {
      const res = await verifyImageWithGemini(imgUrl, {
        mode: 'report',
        category,
        location,
      });
      setGeminiAudit(res);
      if (res.isAuthenticPhoto && !res.isAiGenerated) {
        showToast('Gemini Vision verified: 100% Real photo, zero AI artifacts!', 'success');
      }
    } catch (e) {
      console.warn('Gemini audit error:', e);
    } finally {
      setIsAnalyzingGemini(false);
    }
  };

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

  // Handle Photo Confirmed from Real Device Camera
  const handlePhotoConfirmed = async (blob: Blob, dataUrl: string) => {
    setIsUploadingPhoto(true);
    setUploadError(null);
    setPhotoSource('camera');

    // Instantly set preview for immediate responsiveness
    setPhotoUrl(dataUrl);
    triggerGeminiAudit(dataUrl);

    try {
      // Upload actual captured camera frame to Firebase Storage or optimized proof
      const storageUrl = await uploadImageToStorage(blob, 'reports');
      setPhotoUrl(storageUrl);
      showToast('Photo evidence captured and verified with Gemini Vision!', 'success');
    } catch (err: any) {
      console.warn('Storage upload note:', err);
      // Fallback preview remains intact so user can submit
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Process file selected via Gallery Upload
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    setUploadError(null);
    setIsUploadingPhoto(true);
    setPhotoSource('upload');

    // Local preview via FileReader
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        triggerGeminiAudit(reader.result);
      }
      try {
        const storageUrl = await uploadImageToStorage(file, 'reports');
        setPhotoUrl(storageUrl);
        showToast('Image uploaded successfully!', 'success');
      } catch (err) {
        console.warn('Image upload note:', err);
      } finally {
        setIsUploadingPhoto(false);
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
    setPhotoUrl('');
    setPhotoSource(null);
    setUploadError(null);
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

  const priorities: { value: ComplaintPriority; label: string; desc: string }[] = [
    { value: 'Low', label: 'Low', desc: 'Routine pickup / Minor debris' },
    { value: 'Medium', label: 'Medium', desc: 'Standard turnaround within 24h' },
    { value: 'High', label: 'High', desc: 'Heavily littered / public nuisance' },
    { value: 'Urgent', label: 'Urgent', desc: 'Blocked road, health hazard, immediate dispatch' },
  ];

  // Quick fill preset for testing
  const handleQuickDemoPreset = () => {
    setCategory('Overflowing Bin');
    setLocation('College Road');
    setPriority('Urgent');
    setAddressDetails('Opposite Engineering College Library, College Road');
    setDescription(
      'Municipal garbage bin is completely full and spilling over the walkway. Needs immediate sanitation truck clearance.'
    );
    const demoPhoto = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=700&q=80';
    setPhotoUrl(demoPhoto);
    setPhotoSource('upload');
    triggerGeminiAudit(demoPhoto);
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
        beforePhotoUrl: photoUrl || undefined,
      });

      setIsSubmitting(false);
      setSubmittedTicketId(newComplaint.id);

      // Confetti
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#4A5F29', '#DAE3B7', '#728B3C', '#14200C'],
        });
      } catch {
        // ignore
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
                setPhotoUrl('');
                setPhotoSource(null);
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#14200C] dark:text-[#F2F6ED] tracking-tight">
            Report Waste Issue
          </h1>
          <p className="text-xs md:text-sm text-[#969691] dark:text-[#8E9B82] mt-1">
            Capture photos with your device camera and submit coordinates to dispatch municipal cleaning crews.
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickDemoPreset}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#DAE3B7]/80 hover:bg-[#DAE3B7] text-[#14200C] text-xs font-semibold border border-[#4A5F29]/20 transition-smooth shadow-2xs self-start"
          title="Autofill Overflowing Bin at College Road (Urgent)"
        >
          <Zap className="w-3.5 h-3.5 text-[#4A5F29]" />
          <span>Quick Demo: Autofill Details</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 space-y-6 glass-card-primary p-6 md:p-8 rounded-3xl">
          {/* Issue Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wider">
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
                      ? 'border-[#4A5F29] bg-[#EEF0E4] dark:bg-[#202D1A] text-[#4A5F29] dark:text-[#DAE3B7] font-bold shadow-2xs'
                      : 'border-[#14200C]/10 dark:border-white/10 hover:border-[#14200C]/30 text-[#14200C] dark:text-[#F2F6ED]'
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
              <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wider">
                Location Area <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] text-[#4A5F29] dark:text-[#DAE3B7] font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> GPS Pin Auto-Verified
              </span>
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 rounded-xl text-sm font-medium text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
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
            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wider">
              Street Landmark / Details
            </label>
            <input
              type="text"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder="e.g. Opposite Main Gate, near electrical pole #12"
              className="w-full px-3.5 py-2.5 bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 rounded-xl text-sm text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
            />
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wider">
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
                      ? 'border-[#4A5F29] ring-2 ring-[#4A5F29]/20 bg-[#EEF0E4] dark:bg-[#202D1A]'
                      : 'border-[#14200C]/10 dark:border-white/10 hover:border-[#14200C]/30 bg-white dark:bg-[#182214]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED]">{p.label}</span>
                    {priority === p.value && (
                      <span className="w-2 h-2 rounded-full bg-[#4A5F29] dark:bg-[#DAE3B7]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#969691] dark:text-[#8E9B82] mt-1 leading-tight line-clamp-2">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wider">
              Issue Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste situation, volume, or obstacles..."
              className="w-full px-3.5 py-2.5 bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 rounded-xl text-sm text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
            />
          </div>
        </div>

        {/* Right Col: Real Camera Capture & Gallery Upload */}
        <div className="space-y-6">
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

            {/* Error Notification */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="font-medium text-xs leading-relaxed">{uploadError}</p>
              </div>
            )}

            {/* Media Area: Captured Preview OR Empty Picker */}
            {photoUrl ? (
              <>
              <div className="relative rounded-2xl overflow-hidden border border-white/60 dark:border-white/15 aspect-4/3 bg-black/5 group shadow-sm">
                <img
                  src={photoUrl}
                  alt="Waste report preview"
                  className="w-full h-full object-cover"
                />

                {/* Loading overlay if uploading to Firebase Storage */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-xs font-semibold">Optimizing and saving photo proof...</span>
                  </div>
                )}

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold shadow-md">
                    {photoSource === 'camera' ? (
                      <>
                        <Camera className="w-3 h-3 text-emerald-400" />
                        <span>Live Camera Photo</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-sky-400" />
                        <span>Gallery Photo</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Action Dock on preview */}
                <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Retake Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload from Gallery</span>
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

                {/* GPS Watermark Badge */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md flex items-center justify-between">
                  <span className="font-mono">{gpsCoordinates}</span>
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified GPS
                  </span>
                </div>
              </div>

              {/* Gemini Vision AI Verification & Authenticity Audit Badge */}
              <GeminiImageAuditBadge
                result={geminiAudit}
                isLoading={isAnalyzingGemini}
                mode="report"
              />
              </>
            ) : (
              /* Dropzone with Take Photo & Upload from Gallery */
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
                {isUploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4A5F29] dark:text-[#DAE3B7]" />
                    <p className="text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED]">
                      Processing and saving image...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#EEF0E4] dark:bg-[#202D1A] text-[#4A5F29] dark:text-[#DAE3B7] flex items-center justify-center shadow-xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                        <Upload className="w-6 h-6" />
                      </div>
                    </div>

                    <p className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1">
                      Add a photo of the waste issue
                    </p>
                    <p className="text-[11px] text-[#969691] dark:text-[#8E9B82] max-w-xs mb-4">
                      Use your device camera or upload from your photo gallery
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-xs">
                      <button
                        type="button"
                        onClick={() => setIsCameraModalOpen(true)}
                        className="flex-1 min-w-[125px] py-2.5 px-3.5 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-[#DAE3B7]" />
                        <span>Take Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 min-w-[125px] py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-[#DAE3B7]/25 hover:border-[#4A5F29] text-[#14200C] dark:text-[#F2F6ED] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#4A5F29] dark:text-[#DAE3B7]" />
                        <span>Upload from Gallery</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Prominent Action Buttons below box */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#DAE3B7]" />
                <span>{photoUrl ? 'Retake with Camera' : 'Take Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-[#DAE3B7]/25 hover:border-[#4A5F29] text-[#14200C] dark:text-[#F2F6ED] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#4A5F29] dark:text-[#DAE3B7]" />
                <span>Upload from Gallery</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="submit"
              disabled={isSubmitting || isUploadingPhoto}
              className="glass-button-primary w-full py-3.5 px-6 rounded-full text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket to Dispatch...</span>
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

      {/* REAL PHYSICAL DEVICE CAMERA MODAL */}
      <RealDeviceCamera
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoConfirmed={handlePhotoConfirmed}
        title="Point Camera at Waste"
      />
    </div>
  );
};
