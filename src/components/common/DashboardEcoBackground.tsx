import React from 'react';
import dashboardEcoBg from '../../assets/images/dashboard_eco_bg.jpg';

export const DashboardEcoBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Full-page background illustration layer covering the entire viewport */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-[0.65] dark:opacity-[0.30]"
        style={{
          backgroundImage: `url(${dashboardEcoBg})`,
        }}
      />

      {/* 2. Atmospheric Layer - subtle green/sage transparent gradient for depth and readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F1]/30 via-transparent to-[#EEF0E4]/40 dark:from-[#10160D]/65 dark:via-transparent dark:to-[#10160D]/70" />

      {/* 3. Subtle ambient light orbs to enhance glassmorphism refraction */}
      <div className="absolute top-12 right-1/4 w-[36rem] h-[36rem] rounded-full bg-[#DAE3B7]/25 dark:bg-[#4A5F29]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 left-10 w-[32rem] h-[32rem] rounded-full bg-[#8CA84E]/15 dark:bg-[#202D1A]/30 blur-3xl pointer-events-none" />
    </div>
  );
};
