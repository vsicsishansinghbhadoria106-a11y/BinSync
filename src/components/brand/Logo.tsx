import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
    hero: 'w-22 h-22 sm:w-26 sm:h-26 md:w-28 md:h-28',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    hero: 'text-4xl md:text-5xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* BinSync Icon: Bin outline with looped sync pin & checkmark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconDimensions}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Bin top handle */}
          <path
            d="M42 21.5V17C42 14.5 44.2 12.5 47 12.5H53C55.8 12.5 58 14.5 58 17V21.5"
            stroke="#00A86B"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bin lid rim */}
          <rect
            x="26"
            y="21.5"
            width="48"
            height="7.5"
            rx="3.75"
            stroke="#00A86B"
            strokeWidth="4.5"
            strokeLinejoin="round"
            className="fill-white dark:fill-[#182314]"
          />

          {/* Bin can body outline */}
          <path
            d="M31 29L34.8 75.5C35.2 79.5 38.6 82.5 42.6 82.5H57.4C61.4 82.5 64.8 79.5 65.2 75.5L69 29"
            stroke="#00A86B"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clean background underlay behind sync loop to mask bin lines */}
          <path
            d="M34.5 37.5C25 37.5 18 44.5 18 53.5C18 62.5 25 69.5 34.5 69.5C41 69.5 46.5 65.5 50 60C53.5 65.5 59 69.5 65.5 69.5C75 69.5 82 62.5 82 53.5C82 44.5 75 37.5 65.5 37.5C59 37.5 53.5 41.5 50 47C46.5 41.5 41 37.5 34.5 37.5Z"
            className="fill-white dark:fill-[#182314] stroke-white dark:stroke-[#182314]"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Left Loop (Green #00A86B) */}
          <path
            d="M48 56.5C44.5 63 40 68 34.5 68C26 68 19.5 61.5 19.5 53.5C19.5 45.5 26 39 34.5 39C40.5 39 45.5 43 48.5 47"
            stroke="#00A86B"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Green Arrow Head pointing right */}
          <path
            d="M45 42L52 47L45 52"
            stroke="#00A86B"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Loop (Blue #0077D8) */}
          <path
            d="M52 50.5C55.5 44 60 39 65.5 39C74 39 80.5 45.5 80.5 53.5C80.5 61.5 74 68 65.5 68C59.5 68 54.5 64 51.5 60"
            stroke="#0077D8"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Blue Arrow Head pointing left */}
          <path
            d="M55 55L48 60L55 65"
            stroke="#0077D8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Diagonal Crossing Bridge Links */}
          <path
            d="M48.5 47L53.5 53.5"
            stroke="#0077D8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M51.5 60L46.5 53.5"
            stroke="#00A86B"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Green Location Pin inside Left Loop */}
          <path
            d="M34.5 44C31.5 44 29 46.5 29 49.5C29 53 34.5 58.5 34.5 58.5C34.5 58.5 40 53 40 49.5C40 46.5 37.5 44 34.5 44Z"
            fill="#00A86B"
          />
          <circle
            cx="34.5"
            cy="49.5"
            r="2.2"
            className="fill-white dark:fill-[#182314]"
          />

          {/* Blue Checkmark inside Right Loop */}
          <path
            d="M60.5 53.5L64.5 57.5L72 47.5"
            stroke="#0077D8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex items-baseline font-bold tracking-tight">
          <span className={`text-[#00A86B] ${textSizes}`}>Bin</span>
          <span className={`text-[#0077D8] ${textSizes}`}>Sync</span>
        </div>
      )}
    </div>
  );
};
