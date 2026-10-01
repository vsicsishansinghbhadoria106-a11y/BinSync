import React from 'react';
import { ImageVerificationResult } from '../../lib/geminiVerification';
import { ShieldCheck, AlertTriangle, Sparkles, CheckCircle2, Eye, Camera } from 'lucide-react';

interface Props {
  result: ImageVerificationResult | null;
  isLoading?: boolean;
  mode?: 'report' | 'cleanup' | 'detail';
}

export const GeminiImageAuditBadge: React.FC<Props> = ({
  result,
  isLoading = false,
  mode = 'report',
}) => {
  if (isLoading) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#EEF0E4]/70 dark:bg-[#202D1A]/70 border border-[#4A5F29]/20 animate-pulse flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#4A5F29] dark:text-[#DAE3B7] animate-spin" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED]">
            Gemini Multimodal Vision Analysis in progress...
          </p>
          <p className="text-[11px] text-[#969691] dark:text-[#DAE3B7]/70">
            Checking optical sensor reality, AI generation detection & waste categorization
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isReal = result.isAuthenticPhoto && !result.isAiGenerated;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-3 ${
        isReal
          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100'
          : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/40 text-amber-950 dark:text-amber-100'
      }`}
    >
      {/* Header pill & badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isReal ? (
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini Vision AI Authenticity Audit
            </span>
            <p className="text-xs font-extrabold">
              {isReal ? 'Verified Real Photo · 0% AI-Generated' : 'Flagged: Potential Synthetic / AI Render'}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/80 dark:bg-black/30 border border-current shadow-2xs">
          {isReal
            ? `Authentic Camera Shot (${100 - result.aiDetectionConfidence}% Confidence)`
            : `AI Risk: ${result.aiDetectionConfidence}%`}
        </span>
      </div>

      {/* Summary explanation */}
      <p className="text-xs leading-relaxed opacity-90 font-medium">
        {result.authenticitySummary}
      </p>

      {/* Visual Observations Tags */}
      {result.keyObservations && result.keyObservations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {result.keyObservations.map((obs, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40 border border-black/05 dark:border-white/10 flex items-center gap-1"
            >
              <Eye className="w-2.5 h-2.5 opacity-60" />
              <span>{obs}</span>
            </span>
          ))}
        </div>
      )}

      {/* Cleanup Comparison Match Card (If Before vs After mode) */}
      {result.cleanupMatch && (
        <div className="mt-2 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Before/After Site Match Verification:
            </span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {result.cleanupMatch.matchConfidence}% Match
            </span>
          </div>
          <p className="text-[11px] opacity-85 leading-relaxed">
            {result.cleanupMatch.cleanupSummary}
          </p>
        </div>
      )}
    </div>
  );
};
