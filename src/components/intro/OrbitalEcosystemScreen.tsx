import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../../types';
import { Logo } from '../brand/Logo';
import { User, HardHat, Shield, Globe, Sun, Moon, Pause, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OrbitalEcosystemScreenProps {
  onSelectRole: (role: UserRole) => void;
}

// 8 Distinct Environmental Elements directly inspired by the uploaded reference image
interface EcoElement {
  id: string;
  name: string;
  angleOffset: number; // In radians (0 to 2*PI)
  renderIcon: () => React.ReactNode;
}

export const OrbitalEcosystemScreen: React.FC<OrbitalEcosystemScreenProps> = ({ onSelectRole }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [orbitAngle, setOrbitAngle] = useState<number>(0);
  const [radius, setRadius] = useState<number>(205); // Default desktop radius
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Measure and adjust radius dynamically for desktop / tablet / mobile
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Calculate max radius that fits comfortably without overflowing
      let targetRadius = 205;
      if (width < 480 || height < 700) {
        targetRadius = Math.min(130, Math.floor(width * 0.34));
      } else if (width < 768 || height < 820) {
        targetRadius = Math.min(165, Math.floor(width * 0.38));
      } else {
        targetRadius = Math.min(210, Math.floor(width * 0.22));
      }
      setRadius(targetRadius);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }
    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPlaying(false);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Animation Loop: 25 seconds for one complete 360-degree revolution (0.251 rad/sec)
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const DURATION_SECONDS = 26; // 26 seconds for a calm, relaxing revolution
    const SPEED = (2 * Math.PI) / DURATION_SECONDS;

    const animate = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (timestamp - lastTimeRef.current) / 1000;
        setOrbitAngle((prev) => (prev + delta * SPEED) % (2 * Math.PI));
      }
      lastTimeRef.current = timestamp;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // The 8 Environmental Icons around the perimeter from the uploaded reference image:
  // 1. Eco Shopping Bag (with recycle logo)
  // 2. 3-Arrow Recycling Symbol
  // 3. Hands Holding Plant Leaves / Sprout
  // 4. Eco House with Leaf
  // 5. Electric Vehicle with plug & leaf
  // 6. Modern Green Buildings with Leaf
  // 7. Green Bicycle
  // 8. Planet Earth / Globe
  const ecoElements: EcoElement[] = [
    {
      id: 'bag',
      name: 'Recycling Bag',
      angleOffset: -Math.PI / 2, // Top (12 o'clock)
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-xs" fill="none">
          {/* Bag Body */}
          <path
            d="M18 20V52C18 54.2 19.8 56 22 56H42C44.2 56 46 54.2 46 52V20H18Z"
            fill="#B4CE97"
            stroke="#203417"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Bag Handles */}
          <path
            d="M26 20V12C26 9.8 27.8 8 30 8H34C36.2 8 38 9.8 38 12V20"
            stroke="#203417"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inside handle cutout */}
          <rect x="26" y="16" width="12" height="10" rx="3" fill="#F7F7F1" stroke="#203417" strokeWidth="2" />
          {/* Recycling emblem on bag */}
          <path
            d="M32 32L35 37H29L32 32Z"
            fill="#203417"
          />
          <path
            d="M35 43L31 46L32 40"
            stroke="#203417"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 43L33 46L32 40"
            stroke="#203417"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'recycle',
      name: 'Recycle Symbol',
      angleOffset: -Math.PI / 4, // 1:30 o'clock
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-xs" fill="none">
          {/* Top Arrow */}
          <path
            d="M28 14H36L34 20H26L28 14Z"
            fill="#8FA876"
            stroke="#203417"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M38 17L44 23L38 29V25H32V19H38V17Z" fill="#A7C28C" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Bottom Right Arrow */}
          <path d="M46 36L42 43L37 40L41 33L46 36Z" fill="#8FA876" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M40 45L40 53L32 50L34 46L29 43L32 37L40 45Z" fill="#A7C28C" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Bottom Left Arrow */}
          <path d="M19 40L23 33L28 36L24 43L19 40Z" fill="#8FA876" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M22 25L16 28L18 36L22 34L25 39L30 36L22 25Z" fill="#A7C28C" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'hands-plant',
      name: 'Hands with Leaves',
      angleOffset: 0, // 3 o'clock
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 drop-shadow-xs" fill="none">
          {/* Cupped Hands */}
          <path
            d="M14 44C18 44 22 41 24 38C26 36 28 36 30 38V48H14V44Z"
            fill="#D4DEAE"
            stroke="#203417"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M50 44C46 44 42 41 40 38C38 36 36 36 34 38V48H50V44Z"
            fill="#D4DEAE"
            stroke="#203417"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Left Leaf */}
          <path
            d="M32 36C28 28 22 26 22 26C22 26 25 36 32 36Z"
            fill="#4A6E2E"
            stroke="#203417"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M24 28C27 31 29 33 32 36" stroke="#203417" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right Leaf */}
          <path
            d="M32 36C36 26 44 24 44 24C44 24 41 34 32 36Z"
            fill="#729A42"
            stroke="#203417"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M41 26C38 29 35 32 32 36" stroke="#203417" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'house',
      name: 'Eco House',
      angleOffset: Math.PI / 4, // 4:30 o'clock
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-xs" fill="none">
          {/* Roof Triangle */}
          <path
            d="M32 10L10 28H18V52H46V28H54L32 10Z"
            fill="#A3C687"
            stroke="#203417"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Center Leaf inside House */}
          <path
            d="M32 46C26 40 24 32 24 32C24 32 32 33 34 38C36 32 44 30 44 30C44 30 42 38 36 41C34 42 33 44 32 46Z"
            fill="#3F6327"
            stroke="#203417"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M26 34C29 37 31 40 32 46" stroke="#203417" strokeWidth="1.5" />
          <path d="M41 32C38 35 35 39 32 46" stroke="#203417" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'ev',
      name: 'Electric Vehicle',
      angleOffset: Math.PI / 2, // 6 o'clock (Bottom)
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 drop-shadow-xs" fill="none">
          {/* Surrounding orbit badge */}
          <circle cx="32" cy="36" r="22" stroke="#203417" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.6" />
          {/* Top Plug antenna */}
          <path d="M32 14V22" stroke="#203417" strokeWidth="2" strokeLinecap="round" />
          <rect x="29" y="12" width="6" height="4" rx="1" fill="#203417" />
          {/* Car Body */}
          <path
            d="M20 38C20 32 24 24 32 24C40 24 44 32 44 38H46C47.1 38 48 38.9 48 40V46C48 47.1 47.1 48 46 48H18C16.9 48 16 47.1 16 46V40C16 38.9 16.9 38 18 38H20Z"
            fill="#B5D193"
            stroke="#203417"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Windows */}
          <path
            d="M24 36C25 31 28 28 32 28C36 28 39 31 40 36H24Z"
            fill="#F7F7F1"
            stroke="#203417"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Wheels */}
          <circle cx="23" cy="48" r="4.5" fill="#203417" />
          <circle cx="23" cy="48" r="2" fill="#F7F7F1" />
          <circle cx="41" cy="48" r="4.5" fill="#203417" />
          <circle cx="41" cy="48" r="2" fill="#F7F7F1" />
          {/* Leaf emblem at top right of car */}
          <path d="M44 26C47 22 52 23 52 23C52 23 51 28 47 29C45 28 44 26 44 26Z" fill="#4A6E2E" stroke="#203417" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'building',
      name: 'Eco Buildings',
      angleOffset: (3 * Math.PI) / 4, // 7:30 o'clock
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 drop-shadow-xs" fill="none">
          {/* Tall Left Building */}
          <rect x="22" y="16" width="16" height="36" fill="#B4CE97" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Windows on Tall Building */}
          <rect x="25" y="20" width="3" height="3" fill="#203417" />
          <rect x="32" y="20" width="3" height="3" fill="#203417" />
          <rect x="25" y="26" width="3" height="3" fill="#203417" />
          <rect x="32" y="26" width="3" height="3" fill="#203417" />
          {/* Stepped Low Building */}
          <rect x="14" y="30" width="16" height="22" fill="#8FA876" stroke="#203417" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="17" y="34" width="2.5" height="2.5" fill="#203417" />
          <rect x="21" y="34" width="2.5" height="2.5" fill="#203417" />
          <rect x="17" y="40" width="2.5" height="2.5" fill="#203417" />
          <rect x="21" y="40" width="2.5" height="2.5" fill="#203417" />
          <rect x="17" y="46" width="2.5" height="2.5" fill="#203417" />
          <rect x="21" y="46" width="2.5" height="2.5" fill="#203417" />
          {/* Leaf on the right */}
          <path
            d="M38 46C44 40 48 42 48 42C48 42 46 48 40 50C38 48 38 46 38 46Z"
            fill="#3F6327"
            stroke="#203417"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M40 48C43 45 45 44 47 43" stroke="#203417" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      id: 'bicycle',
      name: 'Bicycle',
      angleOffset: Math.PI, // 9 o'clock (Left)
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 drop-shadow-xs" fill="none">
          {/* Wheels */}
          <circle cx="18" cy="42" r="9" stroke="#203417" strokeWidth="2.5" fill="#A7C28C" />
          <circle cx="46" cy="42" r="9" stroke="#203417" strokeWidth="2.5" fill="#A7C28C" />
          <circle cx="18" cy="42" r="2.5" fill="#203417" />
          <circle cx="46" cy="42" r="2.5" fill="#203417" />
          {/* Frame Tubes */}
          <path
            d="M18 42L28 32H38L46 42M28 32L32 42L44 32M32 42L26 26M44 32L42 24H48"
            stroke="#203417"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Seat */}
          <path d="M23 26H29" stroke="#203417" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'globe',
      name: 'Earth / Planet',
      angleOffset: (5 * Math.PI) / 4, // 10:30 o'clock
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-xs" fill="none">
          {/* Ocean Circle */}
          <circle cx="32" cy="32" r="20" fill="#B4CE97" stroke="#203417" strokeWidth="2.5" />
          {/* Continents */}
          <path
            d="M24 22C26 24 28 21 31 23C33 24 35 21 36 25C34 28 32 30 28 29C25 29 23 27 24 22Z"
            fill="#4A6E2E"
            stroke="#203417"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M21 36C23 34 26 36 28 38C26 43 23 44 20 40C20 38 21 36 21 36Z"
            fill="#4A6E2E"
            stroke="#203417"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M37 32C41 33 44 30 46 34C48 38 44 42 40 41C38 38 36 34 37 32Z"
            fill="#4A6E2E"
            stroke="#203417"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F7F7F1] dark:bg-[#121A0F] text-[#14200C] dark:text-[#F2F6ED] flex flex-col justify-between select-none transition-colors duration-200">
      
      {/* ================================================== */}
      {/* TOP UTILITY HEADER                                 */}
      {/* ================================================== */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#EEF0E4] dark:bg-[#202D1A] border border-[#14200C]/10 dark:border-[#DAE3B7]/15 text-[#4A5F29] dark:text-[#DAE3B7] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#4A5F29] dark:bg-[#DAE3B7] animate-pulse" />
            Civic Municipal Portal · Ward 24
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Pause / Play Orbital Animation Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1A2616] border border-[#14200C]/15 dark:border-[#DAE3B7]/20 text-[#4A5F29] dark:text-[#DAE3B7] hover:border-[#4A5F29] transition-all shadow-xs"
            title={isPlaying ? 'Pause orbital animation' : 'Resume orbital animation'}
            aria-label={isPlaying ? 'Pause orbit' : 'Play orbit'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1A2616] border border-[#14200C]/15 dark:border-[#DAE3B7]/20 text-[#14200C] dark:text-[#F2F6ED] hover:border-[#4A5F29] transition-all shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#DAE3B7]" />
            ) : (
              <Moon className="w-4 h-4 text-[#4A5F29]" />
            )}
          </button>
        </div>
      </header>

      {/* ================================================== */}
      {/* MAIN ECOSYSTEM VIEWPORT: CIRCULAR ORBIT + CENTER   */}
      {/* ================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4">
        
        {/* ================================================== */}
        {/* THE CIRCULAR ENVIRONMENTAL ECOSYSTEM               */}
        {/* ================================================== */}
        <div 
          className="relative flex items-center justify-center my-auto"
          style={{
            width: `${radius * 2 + 100}px`,
            height: `${radius * 2 + 100}px`,
            maxWidth: '100vw',
          }}
        >
          {/* Circular Eco Hub Backdrop (Exact palette from reference image) */}
          <div
            className="absolute rounded-full transition-all duration-300"
            style={{
              width: `${radius * 2 + 28}px`,
              height: `${radius * 2 + 28}px`,
              backgroundColor: theme === 'dark' ? 'rgba(34, 48, 27, 0.65)' : '#D7E5B3',
              boxShadow: theme === 'dark'
                ? '0 12px 40px rgba(0,0,0,0.4), inset 0 0 30px rgba(0,0,0,0.3)'
                : '0 10px 35px rgba(45, 71, 32, 0.08), inset 0 0 25px rgba(255,255,255,0.4)',
              filter: 'blur(2.5px)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Double concentric subtle circular track line from reference */}
          <div
            className="absolute rounded-full border border-white/80 dark:border-[#DAE3B7]/30 pointer-events-none"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
          />
          <div
            className="absolute rounded-full border border-white/50 dark:border-[#DAE3B7]/20 pointer-events-none"
            style={{
              width: `${radius * 2 - 12}px`,
              height: `${radius * 2 - 12}px`,
            }}
          />

          {/* ================================================== */}
          {/* ORBITING ENVIRONMENTAL ICONS                       */}
          {/* CRITICAL: ONLY PURE TRANSLATION! ZERO ROTATION!    */}
          {/* Each icon remains 100% upright (rotation = 0deg)   */}
          {/* ================================================== */}
          {ecoElements.map((el) => {
            const currentAngle = orbitAngle + el.angleOffset;
            const x = Math.cos(currentAngle) * radius;
            const y = Math.sin(currentAngle) * radius;

            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center pointer-events-none will-change-transform"
                style={{
                  // PURE X/Y POSITION TRANSLATION. NO ROTATION EVER APPLIED!
                  transform: `translate3d(${x}px, ${y}px, 0)`,
                  transformOrigin: 'center center',
                }}
                aria-label={el.name}
              >
                {/* Upright Icon Container - always facing the exact same direction */}
                <div className="transform hover:scale-110 transition-transform duration-200">
                  {el.renderIcon()}
                </div>
              </div>
            );
          })}

          {/* ================================================== */}
          {/* CENTER OF THE CIRCLE — STATIONARY BINSYNC BRAND    */}
          {/* The center branding must remain completely static  */}
          {/* ================================================== */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 py-5 rounded-full bg-white/75 dark:bg-[#182314]/85 backdrop-blur-md border border-white/80 dark:border-[#DAE3B7]/25 shadow-xl transition-all duration-200 max-w-[220px] sm:max-w-[250px] md:max-w-[270px] aspect-square">
            
            {/* Stationary Logo */}
            <div className="shrink-0 transition-transform duration-300 hover:scale-105">
              <Logo size="hero" showText={false} className="drop-shadow-xs" />
            </div>

            {/* Creative professional BinSync brand typography */}
            <h1 className="-mt-1.5 sm:-mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight font-sans select-none drop-shadow-xs">
              <span className="text-[#00A86B]">Bin</span>
              <span className="text-[#0077D8]">Sync</span>
            </h1>

            {/* Stationary Tagline */}
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#4A5F29] dark:text-[#DAE3B7] tracking-normal leading-snug max-w-[190px] sm:max-w-[210px]">
              From What's Rest to What's Next
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* THREE ROLE PILL BUTTONS (CITIZEN | WORKER | ADMIN) */}
        {/* ================================================== */}
        <div className="w-full max-w-md mx-auto mt-4 sm:mt-6 mb-2">
          {/* Pill Container Group */}
          <div className="p-1.5 sm:p-2 rounded-full bg-[#EEF0E4]/90 dark:bg-[#202D1A] backdrop-blur-md border border-[#14200C]/15 dark:border-[#DAE3B7]/20 shadow-md">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              
              {/* CITIZEN PILL BUTTON */}
              <button
                type="button"
                onClick={() => onSelectRole('citizen')}
                className="group relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-full bg-[#556B2F] hover:bg-[#475A27] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 border border-[#435524]"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DAE3B7] group-hover:text-white transition-colors shrink-0" />
                <span className="truncate">CITIZEN</span>
              </button>

              {/* WORKER PILL BUTTON */}
              <button
                type="button"
                onClick={() => onSelectRole('worker')}
                className="group relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-full bg-[#556B2F] hover:bg-[#475A27] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 border border-[#435524]"
              >
                <HardHat className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DAE3B7] group-hover:text-white transition-colors shrink-0" />
                <span className="truncate">WORKER</span>
              </button>

              {/* ADMIN PILL BUTTON */}
              <button
                type="button"
                onClick={() => onSelectRole('admin')}
                className="group relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-full bg-[#556B2F] hover:bg-[#475A27] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 border border-[#435524]"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DAE3B7] group-hover:text-white transition-colors shrink-0" />
                <span className="truncate">ADMIN</span>
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-[#969691] dark:text-[#8E9B82] font-medium">
            Select your role to access verified municipal credentials
          </p>
        </div>
      </main>

      {/* ================================================== */}
      {/* BOTTOM FOOTER CREDITS                              */}
      {/* ================================================== */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#969691] dark:text-[#8E9B82] gap-1.5 border-t border-[#14200C]/10 dark:border-[#DAE3B7]/15">
        <div>
          Civic-Tech Municipal Waste Dispatch & Audited Tracking Platform
        </div>
        <div className="font-tabular">
          © 2026 BinSync Inc. Designed for Civic Cleanliness.
        </div>
      </footer>
    </div>
  );
};
