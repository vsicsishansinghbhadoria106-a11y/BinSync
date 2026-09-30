import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Truck,
  CheckCircle2,
  HardHat,
  Users,
  ChevronRight,
} from 'lucide-react';
import { MascotDog, MascotBin, TurtleAwarenessBadge, TidyCitizenIcon, SproutIcon } from '../brand/Mascots';

export const LandingHero: React.FC = () => {
  const { setRole, setActiveTab, complaints, pickups, login } = useApp();

  const handleContinueAsUser = () => {
    login('citizen');
  };

  const handleContinueAsAdmin = () => {
    login('admin');
  };

  const activeReportsCount = complaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  ).length;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Container matching DESIGN.md */}
      <section className="relative overflow-hidden rounded-3xl bg-[#EEF0E4] border border-[#14200C]/08 p-8 md:p-14 lg:p-16">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#14200C]/10 text-xs font-bold uppercase tracking-wider text-[#4A5F29]">
            <span className="w-2 h-2 rounded-full bg-[#4A5F29]" />
            <span>Civic Waste Management System</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14200C] leading-[1.1]">
            Report waste easily <span className="text-[#4A5F29]">→</span> Track what happens <span className="text-[#4A5F29]">→</span> Keep the community clean.
          </h1>

          <p className="text-base md:text-lg text-[#14200C]/75 leading-relaxed max-w-2xl">
            BinSync bridges conscious citizens and municipal sanitation crews. Snap a photo of an overflowing bin, track resolution milestones in real-time, or schedule doorstep dry waste collection with verified proof.
          </p>

          {/* Primary Role CTAs (Directly fulfilling Step 1 & Step 4) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={handleContinueAsUser}
              className="px-8 py-4 rounded-full bg-[#4A5F29] text-white text-sm font-bold hover:bg-[#3d4f21] shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 group"
            >
              <span>Continue as User</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleContinueAsAdmin}
              className="px-8 py-4 rounded-full bg-white border border-[#14200C]/15 text-[#14200C] text-sm font-bold hover:bg-[#DAE3B7] shadow-xs transition-smooth flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#4A5F29]" />
              <span>Continue as Admin</span>
            </button>
          </div>

          {/* Live Data Strip */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#14200C]/80 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Municipal Network Active</span>
            </div>
            <span>·</span>
            <span>{activeReportsCount} Active Dispatches Today</span>
            <span>·</span>
            <span>96.4% SLA Compliance</span>
          </div>
        </div>

        {/* Mascot Pair Decoration */}
        <div className="absolute -right-4 bottom-0 hidden lg:flex items-end gap-2 pointer-events-none opacity-90">
          <MascotDog size={200} />
          <MascotBin size={180} />
        </div>
      </section>

      {/* Trust & Verification Strip */}
      <section className="border-y border-[#14200C]/08 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-6 text-xs text-[#969691]">
          <span className="font-semibold uppercase tracking-wider text-[#14200C]">
            Verified Municipal Infrastructure
          </span>
          <div className="flex flex-wrap items-center gap-6 font-medium text-[#14200C]/75">
            <span>🏛️ Ward 24 Municipal Corporation</span>
            <span>📍 College Road & Civil Lines Zone</span>
            <span>♻️ 100% Zero-Landfill Composting</span>
            <span>📋 Tamper-Proof Audit Timeline</span>
          </div>
        </div>
      </section>

      {/* Core 3-Step Civic Value Proposition */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A5F29]">
            How BinSync Works
          </span>
          <h2 className="text-3xl font-extrabold text-[#14200C] tracking-tight mt-1">
            Transparency from Complaint to Clean Pavement.
          </h2>
          <p className="text-sm text-[#969691] mt-2">
            No forgotten complaint numbers or opaque helplines. BinSync enforces accountability at every touchpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white border border-[#14200C]/08 space-y-4 hover:border-[#4A5F29]/30 transition-smooth">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0E4] text-[#4A5F29] flex items-center justify-center font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-[#14200C]">Snap & Auto-Triage</h3>
            <p className="text-xs text-[#14200C]/70 leading-relaxed">
              Capture photo of overflowing bin or illegal dumping. Geo-tagging detects ward coordinates and assigns severity priority automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white border border-[#14200C]/08 space-y-4 hover:border-[#4A5F29]/30 transition-smooth">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0E4] text-[#4A5F29] flex items-center justify-center font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-[#14200C]">Dispatch & Track</h3>
            <p className="text-xs text-[#14200C]/70 leading-relaxed">
              Municipal desk assigns nearest field sanitation crew (like Ramesh Kumar). Watch ticket milestones advance from Under Review to In Progress.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white border border-[#14200C]/08 space-y-4 hover:border-[#4A5F29]/30 transition-smooth">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0E4] text-[#4A5F29] flex items-center justify-center font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-[#14200C]">Photo Proof & Verification</h3>
            <p className="text-xs text-[#14200C]/70 leading-relaxed">
              Staff uploads clean after-photo. Citizen receives resolution notification and confirms verified neighborhood cleanliness.
            </p>
          </div>
        </div>
      </section>

      {/* Awareness Banner */}
      <section className="bg-gradient-to-r from-[#DAE3B7]/50 via-[#EEF0E4] to-[#E0F2FE]/50 rounded-3xl p-8 border border-[#14200C]/08 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <TurtleAwarenessBadge size={90} className="shrink-0" />
          <div>
            <h3 className="text-base font-bold text-[#14200C]">
              Join the "Say No to Plastic" Ward Drive
            </h3>
            <p className="text-xs text-[#14200C]/75 mt-1 max-w-lg">
              Together with over 1,200 households in College Road & Civil Lines, reduce single-use plastic waste and book free doorstep dry waste pickups.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinueAsUser}
          className="px-6 py-3 rounded-full bg-[#14200C] text-white text-xs font-bold hover:bg-[#2c401d] transition-smooth whitespace-nowrap shrink-0"
        >
          Open Citizen Portal
        </button>
      </section>
    </div>
  );
};
