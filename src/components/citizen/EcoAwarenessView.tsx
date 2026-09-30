import React, { useState } from 'react';
import {
  MascotDog,
  MascotBin,
  TurtleAwarenessBadge,
  TidyCitizenIcon,
  SproutIcon,
} from '../brand/Mascots';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Recycle,
  Trash2,
} from 'lucide-react';

export const EcoAwarenessView: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<'wet' | 'dry' | 'hazard'>('wet');

  // Mini interactive sorting challenge
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const streams = {
    wet: {
      title: 'Green Bin — Wet & Biodegradable',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: '🌱',
      items: [
        'Fruit and vegetable peelings',
        'Leftover cooked food & tea bags',
        'Garden cuttings, dry leaves, and flowers',
        'Coffee grounds & eggshells',
        'Biodegradable paper napkins',
      ],
      notAllowed: [
        'Plastic packaging or cling wrap',
        'Glass bottles & soda cans',
        'Diapers & sanitary pads',
      ],
      tip: 'Wet waste is transported directly to our Ward Bio-Methanation & Composting facilities to create organic fertilizer for municipal gardens.',
    },
    dry: {
      title: 'Blue Bin — Recyclable Dry Waste',
      color: 'bg-blue-50 text-blue-800 border-blue-300',
      icon: '📦',
      items: [
        'Corrugated cartons & packaging boxes',
        'Clean plastic bottles (PET), shampoo bottles',
        'Aluminum beverage cans & metal tins',
        'Newspapers, magazines, office shredding',
        'Glass jars (rinsed and dried)',
      ],
      notAllowed: [
        'Food-soiled paper plates or oily pizza boxes',
        'Broken ceramic crockery',
        'Medical syringes or bandages',
      ],
      tip: 'Ensure recyclables are rinsed and completely dry before placing in the blue bin to prevent mold and contamination during sorting.',
    },
    hazard: {
      title: 'Red Bin — Domestic Hazardous Waste',
      color: 'bg-red-50 text-red-800 border-red-300',
      icon: '⚠️',
      items: [
        'Spent lithium & alkaline batteries',
        'Expired medicine tablets & cough syrups',
        'Fluorescent tube lights & CFL bulbs',
        'Aerosol spray cans & paint thinners',
        'Electronic cables & broken chargers',
      ],
      notAllowed: [
        'General biodegradable kitchen waste',
        'Clean cardboard or plastics',
      ],
      tip: 'Hazardous materials contain lead, mercury, and chemical solvents. Never mix them with ordinary garbage or flush them into sewers.',
    },
  };

  const currentStream = streams[selectedStream];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <div className="glass-hero relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4A5F29]">
            <Leaf className="w-3.5 h-3.5" />
            <span>Community Civic Education</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#14200C] tracking-tight">
            Clean Cities Start with Two Bins.
          </h1>

          <p className="text-sm text-[#14200C]/75 leading-relaxed">
            Over 60% of municipal trash can be diverted from landfills through source segregation. Learn how proper waste sorting keeps our streets sanitary and protects neighborhood wildlife.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14200C]">
              <TidyCitizenIcon size={32} />
              <span>Zero-Litter Pledge</span>
            </div>
            <span className="text-[#969691]">·</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5F29]">
              <SproutIcon size={32} />
              <span>100% Ward Composting</span>
            </div>
          </div>
        </div>

        {/* Mascot Mascot Pair */}
        <div className="flex items-center gap-2 shrink-0">
          <MascotDog size={130} />
          <MascotBin size={120} />
        </div>
      </div>

      {/* Segregation Stream Selector */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#14200C]">Municipal Segregation Guide</h2>
            <p className="text-xs text-[#969691]">Select a category to view segregation protocol</p>
          </div>

          <div className="flex items-center gap-2 p-1 glass-card-subtle rounded-xl self-start">
            <button
              onClick={() => setSelectedStream('wet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                selectedStream === 'wet' ? 'bg-[#4A5F29] text-white shadow-xs' : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
              }`}
            >
              🌱 Green (Wet)
            </button>
            <button
              onClick={() => setSelectedStream('dry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                selectedStream === 'dry' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
              }`}
            >
              📦 Blue (Dry)
            </button>
            <button
              onClick={() => setSelectedStream('hazard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                selectedStream === 'hazard' ? 'bg-[#9A4A3A] text-white shadow-xs' : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#14200C]'
              }`}
            >
              ⚠️ Red (Hazard)
            </button>
          </div>
        </div>

        {/* Selected Stream Detail Card */}
        <div className="glass-card-primary rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentStream.icon}</span>
            <div>
              <h3 className="text-lg font-extrabold text-[#14200C]">{currentStream.title}</h3>
              <p className="text-xs text-[#969691] mt-0.5">{currentStream.tip}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#14200C]/08">
            {/* Permitted items */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>What goes in this bin</span>
              </span>
              <ul className="space-y-2">
                {currentStream.items.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#14200C]/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A5F29] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited items */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                <span>Never put in this bin</span>
              </span>
              <ul className="space-y-2">
                {currentStream.notAllowed.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#14200C]/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-700 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Marine & Urban Wildlife Awareness Spotlight (Featuring Shelly the Turtle) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card-secondary p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
          <TurtleAwarenessBadge size={120} className="shrink-0" />
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0369A1] dark:text-sky-300">
              Plastic Reduction Campaign
            </span>
            <h3 className="text-base font-extrabold text-[#14200C] dark:text-[#F2F6ED]">
              Single-Use Plastics Endanger Rivers & Ocean Life
            </h3>
            <p className="text-xs text-[#14200C]/80 dark:text-[#F2F6ED]/80 leading-relaxed font-medium">
              Every thin carry bag discarded in storm gutters ends up in river tributaries. Switch to reusable canvas totes and report illegal plastic dumping on the BinSync app.
            </p>
          </div>
        </div>

        {/* Interactive Sorting Quiz */}
        <div className="lg:col-span-2 p-6 md:p-8 glass-card-primary rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5F29]">
              Quick Citizen Quiz
            </span>
            <span className="text-xs text-[#969691]">Test your sorting skills</span>
          </div>

          <h3 className="text-sm font-bold text-[#14200C]">
            Where should an oily cardboard takeout box with pizza crust be thrown?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setQuizAnswer('blue')}
              className={`p-3 rounded-2xl border text-xs font-bold text-left transition-smooth ${
                quizAnswer === 'blue'
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : 'border-[#14200C]/10 hover:border-[#14200C]/30'
              }`}
            >
              📦 Blue Dry Bin (Cardboard)
            </button>

            <button
              onClick={() => setQuizAnswer('green')}
              className={`p-3 rounded-2xl border text-xs font-bold text-left transition-smooth ${
                quizAnswer === 'green'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-[#14200C]/10 hover:border-[#14200C]/30'
              }`}
            >
              🌱 Green Wet / Compost Bin
            </button>

            <button
              onClick={() => setQuizAnswer('red')}
              className={`p-3 rounded-2xl border text-xs font-bold text-left transition-smooth ${
                quizAnswer === 'red'
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : 'border-[#14200C]/10 hover:border-[#14200C]/30'
              }`}
            >
              ⚠️ Red Hazard Bin
            </button>
          </div>

          {quizAnswer && (
            <div className="p-3.5 rounded-2xl bg-[#EEF0E4] border border-[#4A5F29]/20 text-xs text-[#14200C] animate-in fade-in">
              {quizAnswer === 'green' ? (
                <p>
                  🎉 <strong className="text-emerald-800 font-bold">Correct!</strong> Because it is heavily soiled with food oils and grease, it cannot be recycled with dry paper and belongs in the compost / wet waste stream (or non-recyclable landfill).
                </p>
              ) : (
                <p>
                  💡 <strong className="text-[#4A5F29] font-bold">Good try!</strong> Food oils contaminate paper recycling pulpers. Grease-soaked boxes go to the Green compost bin or separate municipal refuse.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
