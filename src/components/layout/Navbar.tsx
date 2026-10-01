import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import {
  Menu,
  X,
  UserCheck,
  ShieldAlert,
  HardHat,
  PlusCircle,
  Calendar,
  Layers,
  Leaf,
  Users,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Check,
} from 'lucide-react';
import { LANGUAGE_OPTIONS, LanguageCode } from '../../utils/translations';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    complaints,
    pickups,
    resetToDefaultDemoData,
    theme,
    setTheme,
    toggleTheme,
    language,
    setLanguage,
    t,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Active counts for indicators
  const citizenActiveComplaintsCount = complaints.filter(
    (c) =>
      c.reporterName === currentUser.name &&
      c.status !== 'resolved' &&
      c.status !== 'closed'
  ).length;

  const adminUrgentCount = complaints.filter(
    (c) => c.priority === 'Urgent' && c.status !== 'resolved' && c.status !== 'closed'
  ).length;

  const citizenNavItems = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard') },
    { id: 'report', label: t('report_waste', 'Report Waste') },
    {
      id: 'my-complaints',
      label: `${t('my_complaints', 'My Complaints')} (${citizenActiveComplaintsCount})`,
    },
    { id: 'pickups', label: t('scheduled_pickups', 'Scheduled Pickups') },
    { id: 'awareness', label: t('eco_awareness', 'Eco Awareness') },
  ];

  const adminNavItems = [
    { id: 'priority-queue', label: `${t('priority_queue', 'Priority Queue')} (${adminUrgentCount})` },
    { id: 'all-complaints', label: t('all_complaints', 'All Complaints') },
    { id: 'admin-pickups', label: `${t('pickup_dispatch', 'Pickups')} (${pickups.length})` },
    { id: 'workers', label: t('field_staff', 'Field Staff') },
    { id: 'analytics', label: t('zonal_analytics', 'Zonal Analytics') },
  ];

  const workerNavItems = [
    { id: 'my-tasks', label: 'My Assigned Work Orders' },
  ];

  const currentNav = role === 'admin' ? adminNavItems : role === 'worker' ? workerNavItems : citizenNavItems;

  return (
    <header className="sticky top-0 z-40 glass-nav transition-colors">
      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const mainPageTab = role === 'admin' ? 'priority-queue' : role === 'worker' ? 'my-tasks' : 'dashboard';
              setActiveTab(mainPageTab);
            }}
            className="flex items-center gap-2 focus:outline-hidden text-left cursor-pointer transition-transform active:scale-95"
            title="Go to main dashboard"
          >
            <Logo size="md" />
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
          {currentNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors relative py-1 ${
                  isActive
                    ? 'text-[#4A5F29] dark:text-[#DAE3B7] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#4A5F29] dark:after:bg-[#DAE3B7]'
                    : 'text-[#14200C]/75 dark:text-[#F2F6ED]/75 hover:text-[#4A5F29] dark:hover:text-[#DAE3B7]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          {role === 'citizen' && (
            <button
              onClick={() => setActiveTab('report')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white glass-button-primary rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('report_waste', 'Report Waste')}</span>
            </button>
          )}

          {/* Authenticated User Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] bg-white/60 dark:bg-[#182214]/65 backdrop-blur-md border border-white/60 dark:border-white/15 px-2.5 py-1.5 rounded-xl hover:border-[#4A5F29]/40 transition-all shadow-xs"
              title="View Profile Details"
            >
              <div className="w-5 h-5 rounded-full bg-[#DAE3B7] dark:bg-[#4A5F29] text-[#4A5F29] dark:text-[#DAE3B7] flex items-center justify-center font-bold text-[10px]">
                {(currentUser.name || role.charAt(0)).charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-bold truncate max-w-[120px]">
                {currentUser.name || (role === 'admin' ? 'Officer' : role === 'worker' ? 'Worker' : 'Citizen')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#969691] dark:text-[#8E9B82]" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 glass-card-primary rounded-2xl shadow-2xl border border-white/60 dark:border-white/15 p-3 z-50 animate-in fade-in">
                <div className="pb-2.5 border-b border-black/05 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5F29] dark:text-[#DAE3B7]">
                      Live Firestore Profile
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#14200C] dark:text-[#F2F6ED] truncate">
                    {currentUser.name || 'Authenticated User'}
                  </p>
                  <p className="text-xs text-[#969691] dark:text-[#8E9B82] capitalize font-medium">
                    {role} {currentUser.area ? `· ${currentUser.area}` : ''}
                  </p>
                  {currentUser.email && (
                    <p className="text-[11px] text-[#969691] dark:text-[#8E9B82] truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  )}
                  {currentUser.phone && (
                    <p className="text-[11px] text-[#969691] dark:text-[#8E9B82] mt-0.5">
                      {currentUser.phone}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#9A4A3A] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-between"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/15 bg-[#DAE3B7]/70 dark:bg-[#4A5F29]/40 backdrop-blur-md text-[#4A5F29] dark:text-[#DAE3B7] hover:bg-[#DAE3B7]/90 transition-smooth shadow-xs"
            >
              {role === 'citizen' && <UserCheck className="w-3.5 h-3.5" />}
              {role === 'admin' && <ShieldAlert className="w-3.5 h-3.5" />}
              {role === 'worker' && <HardHat className="w-3.5 h-3.5" />}
              <span className="capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-[#4A5F29] dark:text-[#DAE3B7]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card-primary rounded-2xl shadow-2xl border border-white/60 dark:border-white/15 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1 border-b border-black/05 dark:border-white/10">
                  <p className="text-[11px] font-bold text-[#969691] dark:text-[#8E9B82]">Switch System Portal</p>
                </div>
                <button
                  onClick={() => {
                    setRole('citizen');
                    setActiveTab('dashboard');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/50 dark:hover:bg-white/10 ${
                    role === 'citizen' ? 'text-[#4A5F29] dark:text-[#DAE3B7] font-bold bg-[#DAE3B7]/40 dark:bg-[#4A5F29]/30' : 'text-[#14200C] dark:text-[#F2F6ED]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t('citizen_portal', 'Citizen Portal')}</span>
                </button>
                <button
                  onClick={() => {
                    setRole('admin');
                    setActiveTab('priority-queue');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/50 dark:hover:bg-white/10 ${
                    role === 'admin' ? 'text-[#4A5F29] dark:text-[#DAE3B7] font-bold bg-[#DAE3B7]/40 dark:bg-[#4A5F29]/30' : 'text-[#14200C] dark:text-[#F2F6ED]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{t('municipal_admin', 'Municipal Admin')}</span>
                </button>
                <button
                  onClick={() => {
                    setRole('worker');
                    setActiveTab('my-tasks');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/50 dark:hover:bg-white/10 ${
                    role === 'worker' ? 'text-[#4A5F29] dark:text-[#DAE3B7] font-bold bg-[#DAE3B7]/40 dark:bg-[#4A5F29]/30' : 'text-[#14200C] dark:text-[#F2F6ED]'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Sanitation Worker Portal</span>
                </button>
                <div className="border-t border-black/05 dark:border-white/10 my-1" />
                <button
                  onClick={() => {
                    logout();
                    setRoleDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-[#9A4A3A] hover:bg-red-50 dark:hover:bg-red-950/40 font-bold"
                >
                  <span>Logout / Switch Role</span>
                </button>
              </div>
            )}
          </div>

          {/* Logout / Switch Mode button directly in nav */}
          <button
            onClick={logout}
            className="hidden sm:inline-flex items-center text-xs font-bold text-[#9A4A3A] hover:text-red-700 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100/70 border border-red-200/60 dark:border-red-900/40 rounded-xl transition-colors px-2.5 py-1.5 shadow-2xs"
            title="Log out and return to role selection"
          >
            {t('logout', 'Logout')}
          </button>

          {/* Hamburger button (accessible for Menu, Theme, and Language) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#14200C] dark:text-[#F2F6ED] hover:bg-white/60 dark:hover:bg-white/10 rounded-xl border border-white/50 dark:border-white/15 bg-white/40 dark:bg-black/20 backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-2xs"
            aria-label="Toggle menu, theme and language options"
            title="Menu, Theme & Language Options"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="hidden sm:inline text-xs font-bold text-[#14200C] dark:text-[#F2F6ED]">
              {theme === 'dark' ? '🌙' : '☀️'} {language.substring(0, 2).toUpperCase()}
            </span>
          </button>
        </div>
      </div>

      {/* Hamburger Drawer Menu */}
      {mobileMenuOpen && (
        <div className="glass-nav border-b border-white/50 dark:border-white/15 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Eco Awareness Shortcut (Shifted from bottom of prototype) */}
          <div className="pb-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('awareness');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-smooth ${
                activeTab === 'awareness'
                  ? 'bg-[#4A5F29] text-white border-[#4A5F29] shadow-xs'
                  : 'bg-white/70 dark:bg-[#202D1A] hover:bg-[#EEF0E4] dark:hover:bg-[#283921] border-[#14200C]/10 dark:border-[#DAE3B7]/20 text-[#14200C] dark:text-[#F2F6ED] shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#4A5F29]/15 dark:bg-[#DAE3B7]/20 text-[#4A5F29] dark:text-[#DAE3B7] flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold">Eco Awareness</span>
              </div>
              <span className="text-[11px] font-semibold text-[#4A5F29] dark:text-[#DAE3B7]">
                Civic Guide →
              </span>
            </button>
          </div>

          {/* Navigation Links for Mobile */}
          <div className="lg:hidden space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#969691] px-1 pb-1">
              Navigation
            </p>
            {currentNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#EEF0E4] text-[#4A5F29] font-bold'
                    : 'text-[#14200C]/80 hover:bg-[#F7F7F1]'
                }`}
              >
                {item.label}
              </button>
            ))}

            {role === 'citizen' && (
              <button
                onClick={() => {
                  setActiveTab('report');
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-[#4A5F29] rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('report_waste', 'Report Waste')}</span>
              </button>
            )}
          </div>

          <div className="border-t border-[#14200C]/08 pt-3 space-y-3">
            {/* THEME (Dark / Light) FUNCTIONAL KEYS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14200C] flex items-center gap-1.5">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-[#8CA84E]" /> : <Sun className="w-4 h-4 text-amber-600" />}
                  <span>{t('theme', 'Theme')} ({theme === 'dark' ? t('dark_mode', 'Dark') : t('light_mode', 'Light')})</span>
                </span>
                <span className="text-[11px] text-[#969691]">Live Mode Switch</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-smooth ${
                    theme === 'light'
                      ? 'bg-[#4A5F29] text-white border-[#4A5F29] shadow-xs'
                      : 'bg-[#F7F7F1] text-[#14200C] border-[#14200C]/15 hover:bg-[#EEF0E4]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('light_mode', 'Light Mode')}</span>
                  {theme === 'light' && <Check className="w-3 h-3 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-smooth ${
                    theme === 'dark'
                      ? 'bg-[#4A5F29] text-white border-[#4A5F29] shadow-xs'
                      : 'bg-[#F7F7F1] text-[#14200C] border-[#14200C]/15 hover:bg-[#EEF0E4]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('dark_mode', 'Dark Mode')}</span>
                  {theme === 'dark' && <Check className="w-3 h-3 ml-1" />}
                </button>
              </div>
            </div>

            {/* LANGUAGE OPTIONS (13 Indian Regional & Official Languages) */}
            <div className="pt-2 border-t border-[#14200C]/08">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14200C] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#4A5F29]" />
                  <span>{t('language', 'Language')} (13 Languages)</span>
                </span>
                <span className="text-[11px] font-semibold text-[#4A5F29] uppercase">
                  {LANGUAGE_OPTIONS.find((l) => l.code === language)?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-smooth flex items-center justify-between ${
                        isSelected
                          ? 'border-[#4A5F29] bg-[#EEF0E4] text-[#4A5F29] font-bold shadow-2xs'
                          : 'border-[#14200C]/10 bg-[#F7F7F1] text-[#14200C] hover:border-[#14200C]/30 hover:bg-white'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <p className="font-semibold truncate">{opt.nativeLabel}</p>
                        <p className="text-[10px] text-[#969691] truncate">{opt.label}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#4A5F29] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[#14200C]/08">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-[#9A4A3A] transition-colors"
              >
                {t('logout', 'Logout')} / Switch Role
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#EEF0E4] hover:bg-[#DAE3B7] text-xs font-semibold text-[#14200C] transition-colors"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

