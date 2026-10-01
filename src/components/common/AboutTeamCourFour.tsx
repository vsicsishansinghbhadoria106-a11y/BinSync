import React from 'react';
import { Users, Crown, Layout, Smartphone, Database, ShieldCheck } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  badge: string;
  initials: string;
  avatarBg: string;
  roleColor: string;
  icon: React.ReactNode;
}

export const AboutTeamCourFour: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Charvi Saxena',
      role: 'Leader & Overall',
      badge: 'Lead',
      initials: 'CS',
      avatarBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300/40',
      roleColor: 'text-amber-700 dark:text-amber-400',
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 2,
      name: 'Yashi Svita',
      role: 'Frontend',
      badge: 'UI/UX',
      initials: 'YS',
      avatarBg: 'bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-300/40',
      roleColor: 'text-sky-700 dark:text-sky-400',
      icon: <Layout className="w-3.5 h-3.5 text-sky-500" />,
    },
    {
      id: 3,
      name: 'Divyanshu Tripathi',
      role: 'Frontend',
      badge: 'Devices',
      initials: 'DT',
      avatarBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300/40',
      roleColor: 'text-emerald-700 dark:text-emerald-400',
      icon: <Smartphone className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: 4,
      name: 'Ishan Singh Bhadoria',
      role: 'Backend',
      badge: 'Cloud Sync',
      initials: 'IB',
      avatarBg: 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300/40',
      roleColor: 'text-purple-700 dark:text-purple-400',
      icon: <Database className="w-3.5 h-3.5 text-purple-500" />,
    },
  ];

  return (
    <div
      id="about-courfour"
      className="p-3 sm:p-4 rounded-2xl bg-[#EEF0E4]/70 dark:bg-[#202D1A]/60 border border-[#14200C]/08 dark:border-white/10 shadow-2xs backdrop-blur-md"
    >
      {/* Small Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#14200C]/06 dark:border-white/08">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#4A5F29] text-white flex items-center justify-center shadow-2xs">
            <Users className="w-3 h-3 text-[#DAE3B7]" />
          </div>
          <span className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] tracking-wide uppercase">
            About Team CourFour
          </span>
          <span className="text-[10px] text-[#969691] dark:text-[#8E9B82] hidden sm:inline">
            · Municipal Civic-Tech Engineering Core
          </span>
        </div>

        <span className="text-[10px] font-semibold text-[#4A5F29] dark:text-[#DAE3B7] bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-full border border-[#4A5F29]/20">
          Ward 24 Core Developers
        </span>
      </div>

      {/* 4 Small Member Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 dark:bg-[#182214]/80 border border-white/70 dark:border-white/10 shadow-2xs hover:border-[#4A5F29]/30 transition-colors"
          >
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center font-extrabold text-[11px] shrink-0 ${member.avatarBg}`}
            >
              {member.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] truncate">
                  {member.name}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-bold tracking-tight truncate ${member.roleColor}`}>
                  {member.role}
                </span>
                <span className="text-[9px] text-[#969691] dark:text-[#8E9B82]">
                  · {member.badge}
                </span>
              </div>
            </div>
            <div className="shrink-0 opacity-70">
              {member.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
