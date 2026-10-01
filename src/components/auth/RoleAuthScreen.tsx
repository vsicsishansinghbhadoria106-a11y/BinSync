import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import { MUNICIPAL_AREAS } from '../../lib/constants';
import { LANGUAGE_OPTIONS } from '../../utils/translations';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  User,
  HardHat,
  ArrowRight,
  ArrowLeft,
  Phone,
  Lock,
  Mail,
  MapPin,
  CheckCircle2,
  Sun,
  Moon,
  Globe,
  Loader2,
  Check,
  ChevronDown,
  Building,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

interface RoleAuthScreenProps {
  onBackToIntro?: () => void;
  initialRole?: UserRole | null;
}

export const RoleAuthScreen: React.FC<RoleAuthScreenProps> = ({ onBackToIntro, initialRole = 'citizen' }) => {
  const {
    login,
    signUpCitizen,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState(() => {
    if (initialRole === 'admin') return 'admin@binsync.gov';
    if (initialRole === 'worker') return 'rajesh.worker@binsync.gov';
    return '';
  });
  const [signInPassword, setSignInPassword] = useState(() => {
    if (initialRole === 'admin') return 'admin123';
    if (initialRole === 'worker') return 'worker123';
    return '';
  });

  // Citizen Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regArea, setRegArea] = useState(MUNICIPAL_AREAS[0]);
  const [regAddress, setRegAddress] = useState('');
  const [regIdType, setRegIdType] = useState('Aadhaar Card');
  const [regIdNumber, setRegIdNumber] = useState('');

  // Handle Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = signInEmail.trim();
    const password = signInPassword;

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  // Handle Citizen Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!regMobile.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }
    if (!regIdNumber.trim()) {
      setErrorMessage(`Please enter your ${regIdType} number.`);
      return;
    }

    setIsLoading(true);
    const result = await signUpCitizen({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      mobile: regMobile.trim(),
      area: regArea,
      address: regAddress.trim(),
      idProofType: regIdType,
      idProofNumber: regIdNumber.trim(),
    });
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F7F1] dark:bg-[#10160D] text-[#14200C] dark:text-[#F2F6ED] transition-colors relative selection:bg-[#DAE3B7] selection:text-[#14200C]">
      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-black/05 dark:border-white/10 glass-nav">
        <div className="flex items-center gap-3">
          {onBackToIntro && (
            <button
              type="button"
              onClick={onBackToIntro}
              className="p-2 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-[#182214]/60 text-xs font-semibold hover:bg-white dark:hover:bg-[#182214] transition-colors flex items-center gap-1.5 cursor-pointer text-[#14200C] dark:text-[#F2F6ED]"
              title="Back to Role Selection"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Role Selection</span>
            </button>
          )}
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div ref={langDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-[#182214]/60 text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-white"
            >
              <Globe className="w-3.5 h-3.5 text-[#4A5F29] dark:text-[#DAE3B7]" />
              <span className="capitalize">{language}</span>
              <ChevronDown className="w-3 h-3 text-[#969691]" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card-primary rounded-2xl shadow-xl border border-white/60 dark:border-white/15 p-2 z-50 animate-in fade-in max-h-72 overflow-y-auto">
                <p className="text-[10px] font-bold text-[#969691] px-2 py-1 uppercase tracking-wider">
                  Select Language
                </p>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      language === opt.code
                        ? 'bg-[#EEF0E4] dark:bg-[#202D1A] font-bold text-[#4A5F29] dark:text-[#DAE3B7]'
                        : 'hover:bg-black/05 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{opt.nativeLabel}</span>
                    {language === opt.code && <Check className="w-3.5 h-3.5 text-[#4A5F29]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-[#182214]/60 text-xs font-semibold hover:bg-white transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-[#8CA84E]" /> : <Sun className="w-4 h-4 text-amber-600" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl glass-card-primary rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-white/15 space-y-6">
          {/* Title & Badge */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAE3B7]/50 dark:bg-[#4A5F29]/30 border border-[#4A5F29]/20 text-[11px] font-bold text-[#4A5F29] dark:text-[#DAE3B7] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Municipal Civic Access · Ward 24</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14200C] dark:text-[#F2F6ED] tracking-tight">
              {authMode === 'signin' ? 'Sign In to BinSync' : 'Register Citizen Account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#969691] dark:text-[#8E9B82] max-w-md mx-auto">
              {authMode === 'signin'
                ? 'Access your municipal waste management portal. Your role is verified automatically.'
                : 'Create your civic resident account to report waste, schedule doorstep pickups, and track progress.'}
            </p>
          </div>

          {/* Toggle between Sign In and Citizen Registration */}
          <div className="flex rounded-2xl bg-[#EEF0E4] dark:bg-[#202D1A] p-1 border border-[#14200C]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-smooth flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-[#182214] text-[#14200C] dark:text-[#F2F6ED] shadow-sm'
                  : 'text-[#969691] hover:text-[#14200C]'
              }`}
            >
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-smooth flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white dark:bg-[#182214] text-[#14200C] dark:text-[#F2F6ED] shadow-sm'
                  : 'text-[#969691] hover:text-[#14200C]'
              }`}
            >
              <span>Citizen Sign-Up</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Form Content */}
          {authMode === 'signin' ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-sm text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-sm text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#EEF0E4]/60 dark:bg-[#202D1A]/60 border border-[#14200C]/08 text-[11px] text-[#969691] leading-relaxed space-y-2">
                <div>
                  ℹ️ <strong>Demo Quick Access:</strong> Click a role to pre-fill credentials
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail('citizen@example.com');
                      setSignInPassword('citizen123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/40 border border-[#14200C]/10 dark:border-white/10 text-[10px] font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:bg-white cursor-pointer"
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail('admin@binsync.gov');
                      setSignInPassword('admin123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/40 border border-[#14200C]/10 dark:border-white/10 text-[10px] font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:bg-white cursor-pointer"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail('rajesh.worker@binsync.gov');
                      setSignInPassword('worker123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/40 border border-[#14200C]/10 dark:border-white/10 text-[10px] font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:bg-white cursor-pointer"
                  >
                    Crew: Rajesh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail('sunita.worker@binsync.gov');
                      setSignInPassword('worker123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/40 border border-[#14200C]/10 dark:border-white/10 text-[10px] font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:bg-white cursor-pointer"
                  >
                    Crew: Sunita
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail('amit.worker@binsync.gov');
                      setSignInPassword('worker123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/40 border border-[#14200C]/10 dark:border-white/10 text-[10px] font-semibold text-[#14200C] dark:text-[#F2F6ED] hover:bg-white cursor-pointer"
                  >
                    Crew: Amit
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="glass-button-primary w-full py-3.5 px-6 rounded-full text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* CITIZEN REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    Municipal Area / Ward <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs font-medium text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                  >
                    {MUNICIPAL_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    Street Address / House No.
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. 142/B Civil Lines"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    ID Proof Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regIdType}
                    onChange={(e) => setRegIdType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs font-medium text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="PAN Card">PAN Card</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14200C] dark:text-[#F2F6ED]">
                    ID Proof Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-[#969691] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={regIdNumber}
                      onChange={(e) => setRegIdNumber(e.target.value)}
                      placeholder="e.g. 1234-5678-9012"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F7F7F1] dark:bg-[#202D1A] border border-[#14200C]/15 dark:border-white/15 text-xs text-[#14200C] dark:text-[#F2F6ED] focus:outline-hidden focus:border-[#4A5F29]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="glass-button-primary w-full py-3.5 px-6 rounded-full text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account & Securing Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create Citizen Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#969691] dark:text-[#8E9B82]">
        © 2026 BinSync Inc. Civic Cleanliness & Municipal Waste Dispatch.
      </footer>
    </div>
  );
};
