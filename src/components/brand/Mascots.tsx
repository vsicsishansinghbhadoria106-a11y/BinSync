import React from 'react';

// Binnie: Dog Mascot in green cap and safety vest winking (from 1.png)
export const MascotDog: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 120,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Left black floppy ear */}
    <ellipse
      cx="45"
      cy="70"
      rx="16"
      ry="42"
      transform="rotate(-40 45 70)"
      fill="#14200C"
    />
    {/* Right black upright ear */}
    <ellipse
      cx="155"
      cy="55"
      rx="15"
      ry="45"
      transform="rotate(12 155 55)"
      fill="#14200C"
    />

    {/* Chubby White Dog Head */}
    <path
      d="M50 115C45 90 60 70 100 70C140 70 155 90 150 115C148 135 130 148 100 148C70 148 52 135 50 115Z"
      fill="#FFFFFF"
      stroke="#14200C"
      strokeWidth="6"
    />

    {/* Green Sanitation Cap */}
    <path
      d="M52 95C52 65 72 45 100 45C128 45 148 65 148 95L52 95Z"
      fill="#4A5F29"
      stroke="#14200C"
      strokeWidth="6"
    />
    <path
      d="M44 95C44 95 70 105 100 105C130 105 156 95 156 95"
      stroke="#14200C"
      strokeWidth="8"
      strokeLinecap="round"
    />

    {/* Cap Recycling Symbol */}
    <g transform="translate(88, 55) scale(0.6)">
      <path
        d="M20 5L28 16H18L18 25H12L12 16H2L10 5Z"
        fill="#FFFFFF"
      />
      <circle cx="20" cy="20" r="14" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="16 8" />
    </g>

    {/* Left eye: playful dot */}
    <circle cx="85" cy="115" r="5" fill="#14200C" />
    {/* Right eye: Winking > */}
    <path
      d="M118 110L126 116L118 122"
      stroke="#14200C"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Cute nose */}
    <ellipse cx="104" cy="122" rx="6" ry="4" fill="#14200C" />

    {/* Rosy blush cheeks */}
    <ellipse cx="72" cy="126" rx="8" ry="5" fill="#FFCCD5" opacity="0.8" />
    <ellipse cx="132" cy="126" rx="8" ry="5" fill="#FFCCD5" opacity="0.8" />

    {/* Body with Green High-Vis Vest */}
    <path
      d="M55 146L40 190H160L145 146"
      fill="#4A5F29"
      stroke="#14200C"
      strokeWidth="6"
    />
    {/* White safety stripes on vest */}
    <rect x="75" y="155" width="8" height="35" fill="#FFFFFF" />
    <rect x="117" y="155" width="8" height="35" fill="#FFFFFF" />
    <path d="M40 180H160" stroke="#FFFFFF" strokeWidth="6" />

    {/* Waving Paw / Peace Sign */}
    <path
      d="M145 125C150 115 158 115 162 125C165 115 174 118 172 130C170 142 155 148 145 140"
      fill="#FFFFFF"
      stroke="#14200C"
      strokeWidth="5"
    />
  </svg>
);

// Cheerful Wheelie Bin Mascot (from 2.png)
export const MascotBin: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 120,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Wheels */}
    <rect x="25" y="170" width="16" height="40" rx="8" fill="#262626" stroke="#14200C" strokeWidth="4" />
    <rect x="159" y="170" width="16" height="40" rx="8" fill="#262626" stroke="#14200C" strokeWidth="4" />

    {/* Yellow Lid Top */}
    <path
      d="M48 45C48 40 52 35 58 35H142C148 35 152 40 152 45L158 60H42L48 45Z"
      fill="#EAB308"
      stroke="#14200C"
      strokeWidth="6"
      strokeLinejoin="round"
    />

    {/* Green Bin Body */}
    <path
      d="M42 60H158L146 200C146 206 141 210 135 210H65C59 210 54 206 54 200L42 60Z"
      fill="#728B3C"
      stroke="#14200C"
      strokeWidth="6"
      strokeLinejoin="round"
    />

    {/* Big Happy Cartoon Eyes */}
    <ellipse cx="80" cy="100" rx="16" ry="22" fill="#FFFFFF" stroke="#14200C" strokeWidth="5" />
    <ellipse cx="120" cy="100" rx="16" ry="22" fill="#FFFFFF" stroke="#14200C" strokeWidth="5" />
    {/* Green Irises */}
    <circle cx="84" cy="102" r="9" fill="#4A5F29" />
    <circle cx="116" cy="102" r="9" fill="#4A5F29" />
    <circle cx="86" cy="99" r="3.5" fill="#FFFFFF" />
    <circle cx="118" cy="99" r="3.5" fill="#FFFFFF" />

    {/* Happy Smile with Tongue */}
    <path
      d="M68 125C75 155 125 155 132 125"
      fill="#831843"
      stroke="#14200C"
      strokeWidth="5"
    />
    <path
      d="M85 140C92 148 108 148 115 140"
      fill="#FB7185"
    />

    {/* White Recycle Logo on Front */}
    <g transform="translate(85, 165) scale(0.7)">
      <path
        d="M20 5L28 18H20V24H14V18H6L14 5H20Z"
        fill="#FFFFFF"
      />
      <path
        d="M32 30L38 18L32 15L27 24L18 20L21 34L32 30Z"
        fill="#FFFFFF"
      />
      <path
        d="M8 30L3 18L9 15L14 24L23 20L20 34L8 30Z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

// Say No To Plastic Turtle (from 3.png)
export const TurtleAwarenessBadge: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 110,
}) => (
  <div className={`relative flex flex-col items-center ${className}`} style={{ width: size }}>
    <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Plastic Bag Outline */}
      <path
        d="M50 20C50 10 65 10 65 30V60H95V30C95 10 110 10 110 20V65C130 70 145 95 140 140C135 170 110 175 80 175C50 175 25 170 20 140C15 95 30 70 50 65V20Z"
        fill="#E0F2FE"
        stroke="#14200C"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Trapped Turtle */}
      <g transform="translate(42, 75)">
        {/* Head */}
        <circle cx="65" cy="18" r="11" fill="#DAE3B7" stroke="#14200C" strokeWidth="4" />
        <circle cx="68" cy="16" r="2" fill="#14200C" />
        {/* Shell */}
        <ellipse cx="38" cy="45" rx="30" ry="28" fill="#4A5F29" stroke="#14200C" strokeWidth="5" />
        {/* Flippers */}
        <ellipse cx="14" cy="28" rx="8" ry="14" transform="rotate(-30 14 28)" fill="#DAE3B7" stroke="#14200C" strokeWidth="4" />
        <ellipse cx="62" cy="28" rx="8" ry="14" transform="rotate(30 62 28)" fill="#DAE3B7" stroke="#14200C" strokeWidth="4" />
        <ellipse cx="16" cy="62" rx="7" ry="12" transform="rotate(30 16 62)" fill="#DAE3B7" stroke="#14200C" strokeWidth="4" />
        <ellipse cx="60" cy="62" rx="7" ry="12" transform="rotate(-30 60 62)" fill="#DAE3B7" stroke="#14200C" strokeWidth="4" />

        {/* HELP! Label on shell */}
        <text
          x="38"
          y="49"
          textAnchor="middle"
          fill="#FFFFFF"
          fontWeight="800"
          fontSize="13"
          letterSpacing="0.05em"
          fontFamily="system-ui, sans-serif"
        >
          HELP!
        </text>
      </g>
    </svg>
    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14200C] mt-0.5 text-center leading-tight">
      SAY NO TO PLASTIC
    </span>
  </div>
);

// Green Tidy Citizen Throwing Trash (from 4.png)
export const TidyCitizenIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 56,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#4A5F29" strokeWidth="7" fill="#FFFFFF" />
    {/* Head */}
    <circle cx="38" cy="32" r="6" fill="#14200C" />
    {/* Torso & Legs */}
    <path
      d="M33 42H43V64H39V82H33V42Z"
      fill="#14200C"
    />
    <path
      d="M38 64H44V82H38V64Z"
      fill="#14200C"
    />
    {/* Arm tossing trash */}
    <path
      d="M40 42H58V47H40V42Z"
      fill="#14200C"
    />
    {/* Falling Litter cubes */}
    <rect x="54" y="50" width="4.5" height="4.5" fill="#14200C" />
    <rect x="59" y="56" width="4.5" height="4.5" fill="#14200C" />
    <rect x="59" y="66" width="4.5" height="4.5" fill="#14200C" />
    {/* Bin container */}
    <path
      d="M50 58L55 82H69L74 58"
      stroke="#14200C"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Sprouting Seedling in Soil (from 6.png)
export const SproutIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Soil Mound */}
    <path
      d="M20 78C20 66 32 60 45 60C50 55 60 55 66 60C78 58 85 68 85 78C85 86 20 86 20 78Z"
      fill="#B45309"
      stroke="#14200C"
      strokeWidth="4"
    />
    {/* Stem */}
    <path
      d="M50 60V35"
      stroke="#4A5F29"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Left Leaf */}
    <path
      d="M50 40C30 38 25 22 36 18C46 16 50 32 50 40Z"
      fill="#728B3C"
      stroke="#14200C"
      strokeWidth="3.5"
    />
    {/* Right Leaf */}
    <path
      d="M50 40C70 38 75 22 64 18C54 16 50 32 50 40Z"
      fill="#728B3C"
      stroke="#14200C"
      strokeWidth="3.5"
    />
  </svg>
);
