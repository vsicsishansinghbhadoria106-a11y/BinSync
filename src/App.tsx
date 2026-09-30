import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { ReportWasteView } from './components/citizen/ReportWasteView';
import { MyComplaintsView } from './components/citizen/MyComplaintsView';
import { SchedulePickupView } from './components/citizen/SchedulePickupView';
import { EcoAwarenessView } from './components/citizen/EcoAwarenessView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { LandingHero } from './components/home/LandingHero';
import { Toast } from './components/common/Toast';
import { Logo } from './components/brand/Logo';
import { SproutIcon } from './components/brand/Mascots';
import { RoleAuthScreen } from './components/auth/RoleAuthScreen';
import { OrbitalEcosystemScreen } from './components/intro/OrbitalEcosystemScreen';
import { DashboardEcoBackground } from './components/common/DashboardEcoBackground';
import { UserRole } from './types';

const MainContent: React.FC = () => {
  const { role, activeTab, setActiveTab, setRole } = useApp();

  if (activeTab === 'ecosystem') {
    return (
      <div className="-mt-6 -mx-4 sm:-mx-6">
        <OrbitalEcosystemScreen
          onSelectRole={(targetRole) => {
            setRole(targetRole);
            setActiveTab(targetRole === 'admin' ? 'priority-queue' : targetRole === 'worker' ? 'my-tasks' : 'dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      {/* If viewing landing/home */}
      {activeTab === 'landing' ? (
        <LandingHero />
      ) : role === 'admin' ? (
        <AdminDashboard />
      ) : role === 'worker' ? (
        <WorkerDashboard />
      ) : (
        <>
          {activeTab === 'dashboard' && <CitizenDashboard />}
          {activeTab === 'report' && <ReportWasteView />}
          {activeTab === 'my-complaints' && <MyComplaintsView />}
          {activeTab === 'pickups' && <SchedulePickupView />}
          {activeTab === 'awareness' && <EcoAwarenessView />}
        </>
      )}
    </main>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/50 dark:border-white/10 bg-white/60 dark:bg-[#182214]/65 backdrop-blur-xl py-12 text-[#14200C]/75 dark:text-[#F2F6ED]/75 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Logo size="sm" />
          <div className="h-4 w-px bg-[#14200C]/15 dark:bg-white/20 hidden sm:block" />
          <p className="text-[#969691] dark:text-[#8E9B82]">
            Civic-Tech Municipal Waste Dispatch & Audited Tracking Platform · Ward 24
          </p>
        </div>

        <div className="text-[#969691] dark:text-[#8E9B82] text-center sm:text-right font-tabular">
          © 2026 BinSync Inc. Designed for Civic Cleanliness.
        </div>
      </div>
    </footer>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole | null>(null);

  if (!isAuthenticated) {
    // FIRST PAGE — ONLY ROLE SELECTION (No login forms, email, password, or phone fields)
    if (!selectedRoleForAuth) {
      return (
        <>
          <OrbitalEcosystemScreen
            onSelectRole={(role) => {
              setSelectedRoleForAuth(role);
            }}
          />
          <Toast />
        </>
      );
    }

    // AUTHENTICATION SCREEN — Only shown AFTER the user has chosen a role
    return (
      <>
        <RoleAuthScreen
          initialRole={selectedRoleForAuth}
          onBackToIntro={() => setSelectedRoleForAuth(null)}
        />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative overflow-x-hidden">
      <DashboardEcoBackground />
      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />
      </div>
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
