import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupWasteType } from '../../types';
import { MUNICIPAL_AREAS } from '../../data/mockData';
import {
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SchedulePickupView: React.FC = () => {
  const { pickups, currentUser, createPickupRequest } = useApp();

  const userPickups = pickups.filter(
    (p) =>
      (p.requesterId && p.requesterId === currentUser.uid) ||
      (currentUser.name && p.requesterName?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  const [wasteType, setWasteType] = useState<PickupWasteType>('Dry Waste');
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 11:00 AM');
  const [address, setAddress] = useState<string>(currentUser.address || 'House #24, Lane 2, College Road');
  const [area, setArea] = useState<string>(currentUser.area || 'College Road');
  const [estimatedWeight, setEstimatedWeight] = useState<string>('15-20 kg');
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Segregated clean dry waste: corrugated cardboard boxes, clean plastic bottles, and paper bundles tied in jute rope.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPickupId, setCreatedPickupId] = useState<string | null>(null);

  const wasteTypes: { type: PickupWasteType; desc: string; icon: string }[] = [
    { type: 'Dry Waste', desc: 'Paper, cardboard, plastic, dry wrappers', icon: '📦' },
    { type: 'E-Waste', desc: 'Broken electronics, batteries, wires', icon: '🔌' },
    { type: 'Hazardous', desc: 'Paints, chemicals, mercury bulbs', icon: '☣️' },
    { type: 'Organic Waste', desc: 'Compostable bulk garden foliage', icon: '🌱' },
    { type: 'Bulk Furniture', desc: 'Couches, mattresses, timber pallets', icon: '🪑' },
  ];

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '09:00 AM - 11:00 AM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];

  const handleQuickPreset = () => {
    setWasteType('Dry Waste');
    setScheduledDate('2026-10-02');
    setTimeSlot('09:00 AM - 11:00 AM');
    setAddress('House #24, Lane 2, College Road');
    setArea('College Road');
    setEstimatedWeight('15-20 kg');
    setSpecialInstructions('Bundled cardboard and dry plastic containers.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newPickup = createPickupRequest({
        wasteType,
        scheduledDate,
        timeSlot,
        address,
        area,
        estimatedWeight,
        specialInstructions,
      });

      setIsSubmitting(false);
      setCreatedPickupId(newPickup.id);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4A5F29', '#DAE3B7', '#0284C7'],
        });
      } catch {
        // ignore
      }
    }, 350);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Picked Up':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#14200C]/08">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#14200C] tracking-tight">
            Schedule Waste Pickup
          </h1>
          <p className="text-xs md:text-sm text-[#969691] mt-1">
            Book doorstep collection for recyclable dry waste, bulky goods, and e-waste.
          </p>
        </div>

        {/* 1-Click Demo Shortcut */}
        <button
          type="button"
          onClick={handleQuickPreset}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#DAE3B7]/80 hover:bg-[#DAE3B7] text-[#14200C] text-xs font-semibold border border-[#4A5F29]/20 transition-smooth shadow-2xs self-start"
          title="Autofill Dry Waste Pickup booking"
        >
          <Zap className="w-3.5 h-3.5 text-[#4A5F29]" />
          <span>Quick Preset: Dry Waste (02 Oct, Morning)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Schedule Form */}
        <div className="lg:col-span-2">
          {createdPickupId ? (
            <div className="glass-hero rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-[#DAE3B7] text-[#4A5F29] flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5F29] dark:text-[#DAE3B7] bg-[#DAE3B7]/50 dark:bg-[#4A5F29]/30 border border-white/50 dark:border-white/10 px-3 py-1 rounded-full shadow-2xs">
                Pickup Slot Confirmed
              </span>

              <h2 className="text-2xl font-extrabold text-[#14200C] dark:text-[#F2F6ED]">
                Pickup Request Confirmed
              </h2>

              <p className="text-xs text-[#969691] dark:text-[#8E9B82] max-w-md mx-auto font-medium">
                A municipal logistics team will inspect and collect the waste on your chosen slot.
              </p>

              <div className="my-4 p-4 rounded-2xl glass-card-subtle max-w-sm mx-auto space-y-1">
                <p className="text-xs text-[#969691] dark:text-[#8E9B82] uppercase tracking-wider font-bold">
                  Pickup Booking ID
                </p>
                <p className="text-2xl font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7]">
                  {createdPickupId}
                </p>
                <p className="text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED]">
                  {wasteType} · {scheduledDate} · {timeSlot}
                </p>
              </div>

              <button
                onClick={() => setCreatedPickupId(null)}
                className="glass-button-primary px-6 py-2.5 rounded-full text-white text-xs font-bold"
              >
                Schedule Another Pickup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card-primary p-6 md:p-8 rounded-3xl space-y-6">
              {/* Waste Type selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                  Select Waste Category <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {wasteTypes.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setWasteType(item.type)}
                      className={`p-3.5 rounded-2xl border text-left transition-smooth flex items-start gap-3 ${
                        wasteType === item.type
                          ? 'border-[#4A5F29] bg-[#EEF0E4] shadow-2xs ring-2 ring-[#4A5F29]/20'
                          : 'border-[#14200C]/10 hover:border-[#14200C]/30 bg-white'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#14200C]">{item.type}</p>
                        <p className="text-[11px] text-[#969691] mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                    Pickup Date <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm font-medium text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                    Time Window <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm font-medium text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                    Municipal Area <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm font-medium text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                  >
                    {MUNICIPAL_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                    Estimated Weight
                  </label>
                  <select
                    value={estimatedWeight}
                    onChange={(e) => setEstimatedWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm font-medium text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                  >
                    <option value="5-10 kg">5 - 10 kg (Small bundle)</option>
                    <option value="15-20 kg">15 - 20 kg (Standard carton)</option>
                    <option value="25-50 kg">25 - 50 kg (Multiple bags)</option>
                    <option value="50+ kg">50+ kg (Commercial / Bulk)</option>
                  </select>
                </div>
              </div>

              {/* Exact Doorstep Address */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                  Pickup Street & Flat / House Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 24, Lane 2, College Road"
                  className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#14200C] uppercase tracking-wider">
                  Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Instructions for collection vehicle access..."
                  className="w-full px-3.5 py-2.5 bg-[#F7F7F1] border border-[#14200C]/15 rounded-xl text-sm text-[#14200C] focus:outline-hidden focus:border-[#4A5F29]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-[#4A5F29] text-white text-sm font-bold hover:bg-[#3d4f21] shadow-xs hover:shadow-md transition-smooth flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking Vehicle Slot...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Pickup Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Col: Active Pickups & Status Progression */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#14200C]">Your Pickup Requests</h2>
            <span className="text-xs text-[#969691]">{userPickups.length} Total</span>
          </div>

          {userPickups.length === 0 ? (
            <div className="p-8 text-center glass-card-primary rounded-3xl">
              <Package className="w-8 h-8 text-[#969691] dark:text-[#8E9B82] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED]">No scheduled pickups</p>
              <p className="text-[11px] text-[#969691] dark:text-[#8E9B82] mt-1">Book dry waste or e-waste collection</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userPickups.map((p) => {
                const badgeStyle = getStatusColor(p.status);
                return (
                  <div
                    key={p.id}
                    className="p-4 glass-card-primary rounded-2xl space-y-2 hover:border-[#4A5F29]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 px-2 py-0.5 rounded">
                        {p.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badgeStyle}`}>
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED]">{p.wasteType}</h4>
                      <p className="text-[11px] text-[#14200C]/70 dark:text-[#F2F6ED]/70 flex items-center gap-1 mt-0.5 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{p.scheduledDate} · {p.timeSlot}</span>
                      </p>
                    </div>

                    <div className="text-[11px] text-[#14200C]/80 pt-1 border-t border-[#14200C]/05 flex items-center justify-between">
                      <span className="truncate max-w-[160px]">{p.address}</span>
                      {p.assignedWorker ? (
                        <span className="text-[#4A5F29] font-semibold text-[10px]">
                          Driver: {p.assignedWorker.name}
                        </span>
                      ) : (
                        <span className="text-[#969691] text-[10px]">Pending Truck</span>
                      )}
                    </div>

                    {/* Mini Timeline Progress Indicator */}
                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#969691]">
                      <span className={p.status === 'Requested' ? 'text-[#4A5F29] font-bold' : ''}>Requested</span>
                      <span>→</span>
                      <span className={p.status === 'Scheduled' ? 'text-[#4A5F29] font-bold' : ''}>Scheduled</span>
                      <span>→</span>
                      <span className={p.status === 'Assigned' ? 'text-[#4A5F29] font-bold' : ''}>Assigned</span>
                      <span>→</span>
                      <span className={p.status === 'Picked Up' ? 'text-[#4A5F29] font-bold' : ''}>Picked Up</span>
                      <span>→</span>
                      <span className={p.status === 'Completed' ? 'text-emerald-700 font-bold' : ''}>Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
