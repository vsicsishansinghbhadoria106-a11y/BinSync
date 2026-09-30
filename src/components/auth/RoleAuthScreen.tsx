import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile } from '../../types';
import { Logo } from '../brand/Logo';
import { MUNICIPAL_AREAS } from '../../data/mockData';
import { LANGUAGE_OPTIONS, LanguageCode } from '../../utils/translations';
import {
  ShieldCheck,
  User,
  HardHat,
  Shield,
  ArrowRight,
  ArrowLeft,
  Phone,
  Lock,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Loader2,
  Check,
  ChevronDown,
  Building,
} from 'lucide-react';

interface RoleAuthScreenProps {
  initialRole?: UserRole;
  onBackToIntro?: () => void;
}

export const RoleAuthScreen: React.FC<RoleAuthScreenProps> = ({
  initialRole = 'citizen',
  onBackToIntro,
}) => {
  const {
    login,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    workers,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Citizen Form State
  const [citizenMode, setCitizenMode] = useState<'signin' | 'register'>('signin');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [citizenOtp, setCitizenOtp] = useState('4829');
  const [idProofType, setIdProofType] = useState<'AADHAAR CARD' | 'PAN CARD' | 'VOTER ID'>('AADHAAR CARD');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [citizenName, setCitizenName] = useState('Aarav Sharma');
  const [citizenWard, setCitizenWard] = useState('College Road');
  const [citizenAddress, setCitizenAddress] = useState('Flat 402, Green Meadows');
  const [citizenError, setCitizenError] = useState<string | null>(null);

  // Worker Form State
  const [workerName, setWorkerName] = useState('Ramesh Kumar');
  const [workerId, setWorkerId] = useState('W-104');
  const [workerUnit, setWorkerUnit] = useState('Sanitation Unit 04');
  const [workerPin, setWorkerPin] = useState('4321');
  const [workerZone, setWorkerZone] = useState('Zone 2 - North Ward');
  const [workerError, setWorkerError] = useState<string | null>(null);

  // Admin Form State
  const [adminName, setAdminName] = useState('Officer Vikram Verma');
  const [adminEmail, setAdminEmail] = useState('officer.verma@binsync.gov.in');
  const [adminPasscode, setAdminPasscode] = useState('admin2026');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Citizen Submit Handler
  const handleCitizenSubmit = (e?: React.FormEvent, customProfile?: Partial<UserProfile>) => {
    if (e) e.preventDefault();
    setCitizenError(null);

    const nameToUse = (customProfile?.name || citizenName).trim();
    const phoneToUse = (customProfile?.phone || citizenPhone).trim();

    if (!nameToUse) {
      setCitizenError('Please enter your full name.');
      return;
    }
    if (!phoneToUse) {
      setCitizenError('Please enter a valid mobile number.');
      return;
    }
    if (citizenMode === 'signin' && !citizenOtp.trim() && !customProfile) {
      setCitizenError('Please enter the 4-digit verification code.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Authenticating citizen profile & ward permissions in Cloud Firestore...');

    setTimeout(() => {
      const userProfile: Partial<UserProfile> = {
        name: nameToUse,
        phone: phoneToUse,
        idProofType: customProfile?.idProofType || idProofType,
        idProofNumber: customProfile?.idProofNumber || idProofNumber.trim() || '5489 2147 9823',
        address: customProfile?.address || (citizenAddress.trim() ? `${citizenAddress.trim()}, ${citizenWard}` : `Green Meadows, ${citizenWard}`),
        area: customProfile?.area || citizenWard,
        role: 'citizen',
      };

      setIsLoading(false);
      login('citizen', userProfile);
    }, 400);
  };

  // Worker Submit Handler
  const handleWorkerSubmit = (e?: React.FormEvent, customProfile?: Partial<UserProfile>) => {
    if (e) e.preventDefault();
    setWorkerError(null);

    const idToUse = (customProfile?.badgeId || workerId).trim();
    const nameToUse = (customProfile?.name || workerName).trim();

    if (!idToUse) {
      setWorkerError('Please enter your worker badge ID.');
      return;
    }
    if (!nameToUse) {
      setWorkerError('Please enter your staff member name.');
      return;
    }
    if ((!workerPin || workerPin.length < 4) && !customProfile) {
      setWorkerError('Please enter your 4-digit security PIN.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Verifying municipal field crew badge & duty zone in Cloud Firestore...');

    setTimeout(() => {
      const userProfile: Partial<UserProfile> = {
        name: nameToUse,
        badgeId: idToUse,
        unit: customProfile?.unit || workerUnit.trim() || 'Sanitation Unit 04',
        zone: customProfile?.zone || workerZone,
        role: 'worker',
      };

      setIsLoading(false);
      login('worker', userProfile);
    }, 400);
  };

  // Admin Submit Handler
  const handleAdminSubmit = (e?: React.FormEvent, customProfile?: Partial<UserProfile>) => {
    if (e) e.preventDefault();
    setAdminError(null);

    const emailToUse = (customProfile?.email || adminEmail).trim();
    const nameToUse = (customProfile?.name || adminName).trim();

    if (!emailToUse || !emailToUse.includes('@')) {
      setAdminError('Please enter an authorized municipal email.');
      return;
    }
    if (!nameToUse) {
      setAdminError('Please enter officer name.');
      return;
    }
    if (!adminPasscode.trim() && !customProfile) {
      setAdminError('Please enter your department security passcode.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Authorizing administrative security clearance in Cloud Firestore...');

    setTimeout(() => {
      const userProfile: Partial<UserProfile> = {
        name: nameToUse,
        email: emailToUse,
        role: 'admin',
        department: customProfile?.department || 'Ward 24 Municipal Administration',
      };

      setIsLoading(false);
      login('admin', userProfile);
    }, 400);
  };

  // Quick 1-click Demo shortcuts with distinct identities
  const handleQuickDemoCitizen = (type: 'aarav' | 'priya') => {
    if (type === 'priya') {
      setCitizenName('Priya Patel');
      setCitizenPhone('+91 98112 34567');
      setCitizenWard('Civil Lines');
      setCitizenAddress('B-12, Officers Colony');
      handleCitizenSubmit(undefined, {
        name: 'Priya Patel',
        phone: '+91 98112 34567',
        area: 'Civil Lines',
        address: 'B-12, Officers Colony, Civil Lines',
        idProofType: 'AADHAAR CARD',
        idProofNumber: '7890 1234 5678',
      });
    } else {
      setCitizenName('Aarav Sharma');
      setCitizenPhone('+91 98765 43210');
      setCitizenWard('College Road');
      setCitizenAddress('Flat 402, Green Meadows');
      handleCitizenSubmit(undefined, {
        name: 'Aarav Sharma',
        phone: '+91 98765 43210',
        area: 'College Road',
        address: 'Flat 402, Green Meadows, College Road',
        idProofType: 'AADHAAR CARD',
        idProofNumber: '5489 2147 9823',
      });
    }
  };

  const handleQuickDemoWorker = (type: 'ramesh' | 'sunita') => {
    if (type === 'sunita') {
      setWorkerName('Sunita Devi');
      setWorkerId('W-208');
      setWorkerUnit('Rapid Response Crew 02');
      setWorkerZone('Zone 1 - Central Ward');
      handleWorkerSubmit(undefined, {
        name: 'Sunita Devi',
        badgeId: 'W-208',
        unit: 'Rapid Response Crew 02',
        zone: 'Zone 1 - Central Ward',
      });
    } else {
      setWorkerName('Ramesh Kumar');
      setWorkerId('W-104');
      setWorkerUnit('Sanitation Unit 04');
      setWorkerZone('Zone 2 - North Ward');
      handleWorkerSubmit(undefined, {
        name: 'Ramesh Kumar',
        badgeId: 'W-104',
        unit: 'Sanitation Unit 04',
        zone: 'Zone 2 - North Ward',
      });
    }
  };

  const handleQuickDemoAdmin = () => {
    setAdminName('Officer Vikram Verma');
    setAdminEmail('officer.verma@binsync.gov.in');
    handleAdminSubmit(undefined, {
      name: 'Officer Vikram Verma',
      email: 'officer.verma@binsync.gov.in',
      department: 'Ward 24 Municipal Administration',
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F1] dark:bg-[#10160D] text-[#14200C] dark:text-[#F2F6ED] flex flex-col transition-colors duration-200">
      {/* Top Utility Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBackToIntro && (
            <button
              type="button"
              onClick={onBackToIntro}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#182214] border border-[#14200C]/15 dark:border-[#DAE3B7]/20 text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] hover:text-[#4A5F29] dark:hover:text-[#DAE3B7] transition-all shadow-xs mr-1"
              title="Return to Role Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <Logo size="sm" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/15 text-[#4A5F29] dark:text-[#DAE3B7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A5F29] dark:bg-[#DAE3B7] animate-pulse" />
            Civic Municipal Portal
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-[#182214] border border-[#14200C]/15 dark:border-[#DAE3B7]/20 text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] transition-smooth shadow-xs"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
              <span className="capitalize">{language}</span>
              <ChevronDown className="w-3 h-3 text-[#969691]" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-[#182214] border border-[#14200C]/15 dark:border-[#DAE3B7]/20 shadow-xl py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-[#969691] uppercase tracking-wider border-b border-[#14200C]/08 dark:border-[#DAE3B7]/10">
                  Select Language
                </div>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#EEF0E4] dark:hover:bg-[#202D1A] transition-colors ${
                      language === opt.code
                        ? 'font-bold text-[#4A5F29] dark:text-[#DAE3B7] bg-[#EEF0E4]/60 dark:bg-[#202D1A]/60'
                        : 'text-[#14200C] dark:text-[#F2F6ED]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[11px] text-[#969691] font-normal">{opt.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#182214] border border-[#14200C]/15 dark:border-[#DAE3B7]/20 text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] transition-smooth shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#DAE3B7]" />
            ) : (
              <Moon className="w-4 h-4 text-[#4A5F29]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          
          {/* ================================================== */}
          {/* SMOOTH ROLE-SPECIFIC FORM CONTAINER */}
          {/* ================================================== */}
          <div className="w-full bg-white dark:bg-[#182214] rounded-3xl border border-[#14200C]/12 dark:border-[#DAE3B7]/15 p-6 sm:p-8 shadow-lg shadow-[#14200C]/05 transition-all duration-300">
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-[#EEF0E4] dark:bg-[#202D1A] flex items-center justify-center text-[#4A5F29] dark:text-[#DAE3B7]">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#14200C] dark:text-[#F2F6ED]">
                    Authenticating
                  </h3>
                  <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70 max-w-xs">
                    {loadingMessage}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && (
              <>
                {/* ------------------------------------------------ */}
                {/* ROLE 1: CITIZEN FORM */}
                {/* ------------------------------------------------ */}
                {selectedRole === 'citizen' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-[#14200C]/08 dark:border-[#DAE3B7]/10">
                      <div>
                        <h2 className="text-lg font-bold text-[#14200C] dark:text-[#F2F6ED] flex items-center gap-2">
                          <span>Citizen Portal</span>
                        </h2>
                        <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70 mt-0.5">
                          Report waste & schedule doorstep collections
                        </p>
                      </div>

                      {/* Sign in / Register Switcher */}
                      <div className="flex rounded-lg bg-[#EEF0E4] dark:bg-[#202D1A] p-0.5 border border-[#14200C]/10 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setCitizenMode('signin')}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            citizenMode === 'signin'
                              ? 'bg-white dark:bg-[#182214] text-[#14200C] dark:text-[#F2F6ED] shadow-xs'
                              : 'text-[#969691] hover:text-[#14200C]'
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => setCitizenMode('register')}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            citizenMode === 'register'
                              ? 'bg-white dark:bg-[#182214] text-[#14200C] dark:text-[#F2F6ED] shadow-xs'
                              : 'text-[#969691] hover:text-[#14200C]'
                          }`}
                        >
                          Register
                        </button>
                      </div>
                    </div>

                    {citizenError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
                        {citizenError}
                      </div>
                    )}

                    <form onSubmit={handleCitizenSubmit} className="space-y-4">
                      {citizenMode === 'signin' ? (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              Citizen Full Name
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={citizenName}
                                onChange={(e) => setCitizenName(e.target.value)}
                                placeholder="e.g. Aarav Sharma, Priya Patel"
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              Mobile Number
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="tel"
                                value={citizenPhone}
                                onChange={(e) => setCitizenPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29]"
                              />
                            </div>
                          </div>

                          {/* Dropdown list ID PROOF */}
                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              ID PROOF
                            </label>
                            <select
                              value={idProofType}
                              onChange={(e) => setIdProofType(e.target.value as any)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-semibold text-[#14200C] dark:text-[#F2F6ED] focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29] cursor-pointer"
                            >
                              <option value="AADHAAR CARD">AADHAAR CARD</option>
                              <option value="PAN CARD">PAN CARD</option>
                              <option value="VOTER ID">VOTER ID</option>
                            </select>
                          </div>

                          {/* Dialogue box for entrying the ID Proof Number */}
                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              ID Proof Number
                            </label>
                            <input
                              type="text"
                              value={idProofNumber}
                              onChange={(e) => setIdProofNumber(e.target.value)}
                              placeholder={
                                idProofType === 'AADHAAR CARD'
                                  ? 'Enter 12-digit Aadhaar Number (e.g. 5489 2147 9823)'
                                  : idProofType === 'PAN CARD'
                                  ? 'Enter 10-character PAN (e.g. ABCDE1234F)'
                                  : 'Enter Voter ID Number (e.g. WBD1234567)'
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium text-[#14200C] dark:text-[#F2F6ED] focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29]"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wide">
                                4-Digit OTP / Passcode
                              </label>
                              <span className="text-[11px] text-[#4A5F29] dark:text-[#DAE3B7] font-semibold">
                                Demo: 4829
                              </span>
                            </div>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="password"
                                maxLength={6}
                                value={citizenOtp}
                                onChange={(e) => setCitizenOtp(e.target.value)}
                                placeholder="Enter 4-digit code"
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29]"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={citizenName}
                              onChange={(e) => setCitizenName(e.target.value)}
                              placeholder="e.g. Aarav Sharma"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              value={citizenPhone}
                              onChange={(e) => setCitizenPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                            />
                          </div>

                          {/* Dropdown list ID PROOF */}
                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              ID PROOF
                            </label>
                            <select
                              value={idProofType}
                              onChange={(e) => setIdProofType(e.target.value as any)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-semibold text-[#14200C] dark:text-[#F2F6ED] focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29] cursor-pointer"
                            >
                              <option value="AADHAAR CARD">AADHAAR CARD</option>
                              <option value="PAN CARD">PAN CARD</option>
                              <option value="VOTER ID">VOTER ID</option>
                            </select>
                          </div>

                          {/* Dialogue box for entrying the ID Proof Number */}
                          <div>
                            <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                              ID Proof Number
                            </label>
                            <input
                              type="text"
                              value={idProofNumber}
                              onChange={(e) => setIdProofNumber(e.target.value)}
                              placeholder={
                                idProofType === 'AADHAAR CARD'
                                  ? 'Enter 12-digit Aadhaar Number (e.g. 5489 2147 9823)'
                                  : idProofType === 'PAN CARD'
                                  ? 'Enter 10-character PAN (e.g. ABCDE1234F)'
                                  : 'Enter Voter ID Number (e.g. WBD1234567)'
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium text-[#14200C] dark:text-[#F2F6ED] focus:outline-none focus:border-[#4A5F29] focus:ring-1 focus:ring-[#4A5F29]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                                Ward / Area
                              </label>
                              <select
                                value={citizenWard}
                                onChange={(e) => setCitizenWard(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                              >
                                {MUNICIPAL_AREAS.map((a) => (
                                  <option key={a} value={a}>
                                    {a}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                                House / Flat
                              </label>
                              <input
                                type="text"
                                value={citizenAddress}
                                onChange={(e) => setCitizenAddress(e.target.value)}
                                placeholder="Flat 402, Green Meadows"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        className="w-full mt-2 py-3 px-4 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-sm font-bold shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 group"
                      >
                        <span>{citizenMode === 'signin' ? 'Sign In as Citizen' : 'Create Citizen Account'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>

                    {/* Quick Demo Shortcuts with distinct identities */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-semibold text-[#969691] text-center">
                        Quick Demo Profiles
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickDemoCitizen('aarav')}
                          className="py-2 px-3 rounded-xl bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/20 text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                          <span>Aarav Sharma (College Rd)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoCitizen('priya')}
                          className="py-2 px-3 rounded-xl bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/20 text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                          <span>Priya Patel (Civil Lines)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------ */}
                {/* ROLE 2: WORKER FORM */}
                {/* ------------------------------------------------ */}
                {selectedRole === 'worker' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="pb-3 border-b border-[#14200C]/08 dark:border-[#DAE3B7]/10">
                      <h2 className="text-lg font-bold text-[#14200C] dark:text-[#F2F6ED] flex items-center gap-2">
                        <span>Municipal Field Staff</span>
                      </h2>
                      <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70 mt-0.5">
                        Sanitation workers, collection drivers & field supervisors
                      </p>
                    </div>

                    {workerError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
                        {workerError}
                      </div>
                    )}

                    <form onSubmit={handleWorkerSubmit} className="space-y-4">
                      {/* Worker existing selector if workers present */}
                      {workers.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                            Existing Registered Staff (Optional Quick Fill)
                          </label>
                          <select
                            onChange={(e) => {
                              const found = workers.find((w) => w.id === e.target.value);
                              if (found) {
                                setWorkerId(found.id);
                                setWorkerName(found.name);
                                setWorkerUnit(found.unit);
                                setWorkerZone(found.zone);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          >
                            <option value="">-- Choose registered worker or enter below --</option>
                            {workers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} · {w.unit} ({w.zone})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                            Worker Full Name
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={workerName}
                              onChange={(e) => setWorkerName(e.target.value)}
                              placeholder="e.g. Ramesh Kumar, Sunita Devi"
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                            Worker Badge ID
                          </label>
                          <div className="relative">
                            <HardHat className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={workerId}
                              onChange={(e) => setWorkerId(e.target.value)}
                              placeholder="e.g. W-104, W-208"
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                            Duty Zone
                          </label>
                          <select
                            value={workerZone}
                            onChange={(e) => setWorkerZone(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          >
                            <option value="Zone 2 - North Ward">Zone 2 - North Ward</option>
                            <option value="Zone 1 - Central Ward">Zone 1 - Central Ward</option>
                            <option value="Zone 3 - South Ward">Zone 3 - South Ward</option>
                            <option value="Zone 4 - East Ward">Zone 4 - East Ward</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                            Sanitation Unit
                          </label>
                          <input
                            type="text"
                            value={workerUnit}
                            onChange={(e) => setWorkerUnit(e.target.value)}
                            placeholder="Sanitation Unit 04"
                            className="w-full px-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wide">
                            4-Digit Staff Security PIN
                          </label>
                          <span className="text-[11px] text-[#4A5F29] dark:text-[#DAE3B7] font-semibold">
                            Demo PIN: 4321
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            maxLength={4}
                            value={workerPin}
                            onChange={(e) => setWorkerPin(e.target.value)}
                            placeholder="4321"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-3 px-4 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-sm font-bold shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 group"
                      >
                        <span>Sign In to Field Dispatch</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>

                    {/* Quick Demo Shortcuts with distinct staff */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-semibold text-[#969691] text-center">
                        Quick Demo Staff Profiles
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickDemoWorker('ramesh')}
                          className="py-2 px-3 rounded-xl bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/20 text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                          <span>Ramesh Kumar (W-104)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoWorker('sunita')}
                          className="py-2 px-3 rounded-xl bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/20 text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                          <span>Sunita Devi (W-208)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------ */}
                {/* ROLE 3: ADMIN FORM */}
                {/* ------------------------------------------------ */}
                {selectedRole === 'admin' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="pb-3 border-b border-[#14200C]/08 dark:border-[#DAE3B7]/10">
                      <h2 className="text-lg font-bold text-[#14200C] dark:text-[#F2F6ED] flex items-center gap-2">
                        <span>Municipal Command Center</span>
                      </h2>
                      <p className="text-xs text-[#969691] dark:text-[#DAE3B7]/70 mt-0.5">
                        Zonal inspectors, SLA triage & resource dispatchers
                      </p>
                    </div>

                    {adminError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
                        {adminError}
                      </div>
                    )}

                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                          Officer Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="e.g. Officer Vikram Verma"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] mb-1.5 uppercase tracking-wide">
                          Officer Municipal Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="officer.verma@binsync.gov.in"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#14200C] dark:text-[#F2F6ED] uppercase tracking-wide">
                            Department Passcode
                          </label>
                          <span className="text-[11px] text-[#4A5F29] dark:text-[#DAE3B7] font-semibold">
                            Demo: admin2026
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#969691] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            value={adminPasscode}
                            onChange={(e) => setAdminPasscode(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#14200C]/15 dark:border-[#DAE3B7]/20 bg-[#F7F7F1]/60 dark:bg-[#202D1A] text-sm font-medium focus:outline-none focus:border-[#4A5F29]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EEF0E4]/60 dark:bg-[#202D1A]/60 border border-[#14200C]/08 text-xs text-[#14200C]/80 dark:text-[#DAE3B7]/80">
                        <ShieldCheck className="w-4 h-4 text-[#4A5F29] dark:text-[#DAE3B7] shrink-0" />
                        <span>Authorized for Ward 24 SLA triage, ticket assignment & dispatch</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-3 px-4 rounded-xl bg-[#4A5F29] hover:bg-[#3d4f21] text-white text-sm font-bold shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 group"
                      >
                        <span>Authorize Municipal Command</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>

                    {/* Quick Demo Shortcut */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleQuickDemoAdmin}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/20 text-xs font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] flex items-center justify-center gap-2 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
                        <span>⚡ Quick Demo: Officer Vikram Verma (Command)</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Clean minimal footer on sign in */}
          <p className="mt-8 text-xs text-[#969691] text-center">
            Ward 24 Municipal Corporation · Audited Civic Cleanliness Platform
          </p>
        </div>
      </main>
    </div>
  );
};
