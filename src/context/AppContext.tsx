import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  PickupRequest,
  PickupWasteType,
  PickupStatus,
  MunicipalWorker,
  AppNotification,
} from '../types';
import { MUNICIPAL_AREAS } from '../data/mockData';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
}

interface AppContextType {
  isAuthenticated: boolean;
  login: (targetRole: UserRole, userProfile?: Partial<UserProfile>) => void;
  logout: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  complaints: Complaint[];
  pickups: PickupRequest[];
  workers: MunicipalWorker[];
  notifications: AppNotification[];
  toast: ToastInfo | null;
  showToast: (message: string, type?: ToastInfo['type']) => void;
  hideToast: () => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  selectedPickupId: string | null;
  setSelectedPickupId: (id: string | null) => void;

  // Theme & Language
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  
  // Complaint Actions
  createComplaint: (data: {
    title: string;
    category: ComplaintCategory;
    location: string;
    addressDetails?: string;
    priority: ComplaintPriority;
    description: string;
    beforePhotoUrl?: string;
  }) => Complaint;
  
  updateComplaintStatus: (
    id: string,
    newStatus: ComplaintStatus,
    note?: string,
    workerId?: string,
    afterPhotoUrl?: string
  ) => void;

  assignComplaintWorker: (
    complaintId: string,
    workerId: string,
    note?: string
  ) => void;

  // Pickup Actions
  createPickupRequest: (data: {
    wasteType: PickupWasteType;
    scheduledDate: string;
    timeSlot: string;
    address: string;
    area: string;
    estimatedWeight?: string;
    specialInstructions?: string;
  }) => PickupRequest;

  updatePickupStatus: (
    id: string,
    newStatus: PickupStatus,
    note?: string,
    workerId?: string
  ) => void;

  assignPickupWorker: (
    pickupId: string,
    workerId: string
  ) => void;

  markNotificationRead: (id: string) => void;
  resetToDefaultDemoData: () => void;
}

const STORAGE_KEYS = {
  COMPLAINTS: 'binsync_complaints_v1',
  PICKUPS: 'binsync_pickups_v1',
  WORKERS: 'binsync_workers_v1',
  ROLE: 'binsync_role_v1',
  USER: 'binsync_user_v1',
  THEME: 'binsync_theme_v1',
  LANG: 'binsync_lang_v1',
};

const defaultEmptyUser: UserProfile = {
  uid: '',
  name: '',
  role: 'citizen',
  area: 'College Road',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('binsync_auth') === 'true';
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved as LanguageCode) || 'english';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'citizen';
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return defaultEmptyUser;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Live arrays with zero hardcoded mock items - entirely populated from Cloud Firestore
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [workers, setWorkers] = useState<MunicipalWorker[]>([]);

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n-1',
      title: 'Real-Time Sync Online',
      message: 'BinSync is directly connected to Cloud Firestore for municipal dispatch.',
      timestamp: new Date().toISOString(),
      type: 'info',
      read: false,
    },
  ]);

  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Sync auth state with Firebase Auth and listen to live user profile in Firestore
  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setIsAuthenticated(true);
        sessionStorage.setItem('binsync_auth', 'true');

        // Real-time listener for current user's profile document
        const userDocRef = doc(db, 'users', fbUser.uid);
        unsubUserDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setCurrentUserState(data);
            if (data.role) setRoleState(data.role);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        });
      } else {
        if (unsubUserDoc) unsubUserDoc();
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  // Real-time Firestore synchronization for complaints, pickups, and workers
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) return;

      // Real-time Complaints collection listener
      const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snapshot) => {
        const loaded: Complaint[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as Complaint));
        // Sort newest first
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setComplaints(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'complaints');
      });

      // Real-time Pickups collection listener
      const unsubPickups = onSnapshot(collection(db, 'pickups'), (snapshot) => {
        const loaded: PickupRequest[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as PickupRequest));
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPickups(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'pickups');
      });

      // Real-time Field Workers listener
      const unsubWorkers = onSnapshot(collection(db, 'workers'), (snapshot) => {
        const loaded: MunicipalWorker[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as MunicipalWorker));
        setWorkers(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'workers');
      });

      return () => {
        unsubComplaints();
        unsubPickups();
        unsubWorkers();
      };
    });

    return () => unsubAuth();
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
  }, [pickups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Theme synchronization effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Language synchronization effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    showToast(`Switched theme to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched theme to ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
      return next;
    });
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    const langObj = TRANSLATIONS[lang];
    showToast(`Language set to ${lang.toUpperCase()}`, 'info');
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.english;
    return langDict[key] || TRANSLATIONS.english[key] || fallback || key;
  };

  const login = async (targetRole: UserRole, userProfile?: Partial<UserProfile>) => {
    setRoleState(targetRole);

    // Initial immediate role routing
    if (targetRole === 'admin') {
      setActiveTab('priority-queue');
    } else if (targetRole === 'worker') {
      setActiveTab('my-tasks');
    } else {
      setActiveTab('dashboard');
    }
    setIsAuthenticated(true);
    sessionStorage.setItem('binsync_auth', 'true');

    // Authenticate with Firebase & persist user data in Firestore
    try {
      let fbUser = auth.currentUser;
      if (!fbUser) {
        const cred = await signInAnonymously(auth);
        fbUser = cred.user;
      }
      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        let existingData: any = {};
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            existingData = snap.data();
          }
        } catch {
          // ignore
        }

        const resolvedName =
          userProfile?.name?.trim() ||
          existingData.name ||
          (targetRole === 'admin'
            ? 'Officer Verma'
            : targetRole === 'worker'
            ? 'Field Staff Member'
            : 'Citizen');

        const profileData: UserProfile = {
          uid: fbUser.uid,
          role: targetRole,
          name: resolvedName,
          phone: userProfile?.phone || existingData.phone || '',
          email: userProfile?.email || existingData.email || '',
          area: userProfile?.area || existingData.area || 'College Road',
          address: userProfile?.address || existingData.address || '',
          idProofType: userProfile?.idProofType || existingData.idProofType || '',
          idProofNumber: userProfile?.idProofNumber || existingData.idProofNumber || '',
          badgeId: userProfile?.badgeId || existingData.badgeId || '',
          unit: userProfile?.unit || existingData.unit || '',
          zone: userProfile?.zone || existingData.zone || '',
          updatedAt: new Date().toISOString(),
          createdAt: existingData.createdAt || new Date().toISOString(),
        };

        await setDoc(userDocRef, profileData, { merge: true });
        setCurrentUserState(profileData);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profileData));

        // If worker, register in workers collection too so admin can see and assign
        if (targetRole === 'worker') {
          const workerRecord: MunicipalWorker = {
            id: profileData.badgeId || fbUser.uid,
            name: profileData.name,
            phone: profileData.phone || '+91 98765 43210',
            zone: profileData.zone || 'Zone 2 - North Ward',
            unit: profileData.unit || 'Sanitation Unit 04',
            status: 'On Duty',
            assignedTasks: 0,
            completedTasks: 0,
            rating: 4.9,
          };
          await setDoc(doc(db, 'workers', workerRecord.id), workerRecord, { merge: true });
        }

        showToast(`Welcome! Signed in as ${resolvedName} (${targetRole.toUpperCase()})`, 'success');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('binsync_auth');
    localStorage.removeItem(STORAGE_KEYS.USER);
    setCurrentUserState(defaultEmptyUser);
    showToast('Signed out of BINSYNC', 'info');
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setCurrentUserState((prev) => ({ ...prev, role: newRole }));
    if (auth.currentUser) {
      setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { role: newRole, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
    if (newRole === 'admin') {
      setActiveTab('priority-queue');
    } else if (newRole === 'worker') {
      setActiveTab('my-tasks');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Switched workspace to ${newRole.toUpperCase()} view`, 'info');
  };

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), user, { merge: true }).catch(() => {});
    }
    showToast(`Switched active profile to ${user.name}`, 'info');
  };

  const showToast = (message: string, type: ToastInfo['type'] = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const hideToast = () => {
    setToast(null);
  };

  const createComplaint = (data: {
    title: string;
    category: ComplaintCategory;
    location: string;
    addressDetails?: string;
    priority: ComplaintPriority;
    description: string;
    beforePhotoUrl?: string;
  }): Complaint => {
    // Generate sequential ticket ID or exact demo ID
    const exists125 = complaints.some((c) => c.id === 'WM-2026-00125');
    const newId = !exists125
      ? 'WM-2026-00125'
      : `WM-2026-00${126 + Math.floor(Math.random() * 100)}`;

    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      id: newId,
      title: data.title || `${data.category} at ${data.location}`,
      category: data.category,
      location: data.location,
      addressDetails: data.addressDetails || `Near Main Junction, ${data.location}`,
      priority: data.priority,
      description: data.description,
      status: 'submitted',
      reporterName: currentUser.name || 'Citizen Resident',
      reporterEmail: currentUser.email || '',
      reporterPhone: currentUser.phone || '',
      reporterId: currentUser.uid || auth.currentUser?.uid || 'anon-citizen',
      createdAt: now,
      updatedAt: now,
      beforePhotoUrl:
        data.beforePhotoUrl ||
        'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80',
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          status: 'submitted',
          title: 'Complaint Registered',
          description: `Report filed by ${currentUser.name || 'Citizen'} for ${data.category}. Priority: ${data.priority}.`,
          timestamp: now,
          actor: currentUser.name || 'Citizen',
          actorRole: 'Citizen',
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    showToast(`Report submitted successfully! Ticket #${newComplaint.id}`, 'success');

    // Persist to Firestore
    if (auth.currentUser) {
      setDoc(doc(db, 'complaints', newComplaint.id), newComplaint, { merge: true })
        .catch((err) => handleFirestoreError(err, OperationType.WRITE, `complaints/${newComplaint.id}`));
    }

    return newComplaint;
  };

  const updateComplaintStatus = (
    id: string,
    newStatus: ComplaintStatus,
    note?: string,
    workerId?: string,
    afterPhotoUrl?: string
  ) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        let assignedWorker = c.assignedWorker;
        if (workerId) {
          const w = workers.find((item) => item.id === workerId);
          if (w) {
            assignedWorker = {
              id: w.id,
              name: w.name,
              phone: w.phone,
              unit: w.unit,
            };
          }
        }

        const statusTitles: Record<ComplaintStatus, string> = {
          submitted: 'Complaint Resubmitted',
          under_review: 'Under Zonal Review',
          assigned: `Dispatched to Sanitation Worker`,
          in_progress: 'Sanitation Operation in Progress',
          resolved: 'Sanitized & Resolved',
          closed: 'Complaint Closed & Confirmed',
        };

        const defaultDescriptions: Record<ComplaintStatus, string> = {
          submitted: 'Ticket entered triage queue.',
          under_review: 'Ward Inspector verified coordinates and categorized priority.',
          assigned: assignedWorker
            ? `Assigned to ${assignedWorker.name} (${assignedWorker.unit}).`
            : 'Assigned to field sanitation crew.',
          in_progress: 'Worker has arrived at location and initiated cleanup.',
          resolved: 'Litter cleared, bin emptied and area disinfected with lime.',
          closed: 'Citizen verified and closed the ticket.',
        };

        const newTimelineEvent = {
          id: `t-${Date.now()}`,
          status: newStatus,
          title: statusTitles[newStatus],
          description: note || defaultDescriptions[newStatus],
          timestamp: now,
          actor: currentUser.name || (role === 'admin' ? 'Municipal Admin' : role === 'worker' ? 'Sanitation Worker' : 'Citizen'),
          actorRole: (role === 'admin' ? 'Admin' : role === 'worker' ? 'Worker' : 'Citizen') as any,
        };

        return {
          ...c,
          status: newStatus,
          updatedAt: now,
          assignedWorker,
          adminNotes: note ? `${c.adminNotes ? c.adminNotes + ' | ' : ''}${note}` : c.adminNotes,
          afterPhotoUrl: afterPhotoUrl || c.afterPhotoUrl || (newStatus === 'resolved' ? 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80' : undefined),
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    showToast(`Ticket #${id} status updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');

    // Persist status update to Firestore
    if (auth.currentUser) {
      const targetComplaint = complaints.find((c) => c.id === id);
      if (targetComplaint) {
        setDoc(doc(db, 'complaints', id), { ...targetComplaint, status: newStatus, updatedAt: now }, { merge: true })
          .catch((err) => handleFirestoreError(err, OperationType.WRITE, `complaints/${id}`));
      }
    }
  };

  const assignComplaintWorker = (complaintId: string, workerId: string, note?: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    updateComplaintStatus(
      complaintId,
      'assigned',
      note || `Assigned to ${worker.name} (${worker.unit})`,
      workerId
    );

    // Update worker task count
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId ? { ...w, assignedTasks: w.assignedTasks + 1 } : w
      )
    );
  };

  const createPickupRequest = (data: {
    wasteType: PickupWasteType;
    scheduledDate: string;
    timeSlot: string;
    address: string;
    area: string;
    estimatedWeight?: string;
    specialInstructions?: string;
  }): PickupRequest => {
    const exists45 = pickups.some((p) => p.id === 'PU-2026-00045');
    const newId = !exists45
      ? 'PU-2026-00045'
      : `PU-2026-000${46 + Math.floor(Math.random() * 50)}`;

    const now = new Date().toISOString();
    const newPickup: PickupRequest = {
      id: newId,
      wasteType: data.wasteType,
      scheduledDate: data.scheduledDate,
      timeSlot: data.timeSlot,
      status: 'Requested',
      address: data.address,
      area: data.area,
      estimatedWeight: data.estimatedWeight || '10-15 kg',
      specialInstructions: data.specialInstructions || '',
      requesterName: currentUser.name || 'Citizen Resident',
      requesterPhone: currentUser.phone || '',
      requesterId: currentUser.uid || auth.currentUser?.uid || 'anon-citizen',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Requested',
          timestamp: now,
          note: `Pickup request created for ${data.wasteType} on ${data.scheduledDate} (${data.timeSlot}).`,
          actor: currentUser.name || 'Citizen',
        },
      ],
    };

    setPickups((prev) => [newPickup, ...prev]);
    showToast(`Pickup scheduled! Booking ID: ${newPickup.id}`, 'success');

    // Persist to Firestore
    if (auth.currentUser) {
      setDoc(doc(db, 'pickups', newPickup.id), newPickup, { merge: true })
        .catch((err) => handleFirestoreError(err, OperationType.WRITE, `pickups/${newPickup.id}`));
    }

    return newPickup;
  };

  const updatePickupStatus = (
    id: string,
    newStatus: PickupStatus,
    note?: string,
    workerId?: string
  ) => {
    const now = new Date().toISOString();
    setPickups((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let assignedWorker = p.assignedWorker;
        if (workerId) {
          const w = workers.find((item) => item.id === workerId);
          if (w) {
            assignedWorker = {
              id: w.id,
              name: w.name,
              phone: w.phone,
              truckId: `DL-01-MW-${1000 + Math.floor(Math.random() * 9000)}`,
            };
          }
        }

        const descriptions: Record<PickupStatus, string> = {
          Requested: 'Booking received in system queue.',
          Scheduled: 'Slot confirmed in municipal logistics roster.',
          Assigned: assignedWorker ? `Assigned to ${assignedWorker.name} (${assignedWorker.truckId}).` : 'Assigned to collection truck.',
          'Picked Up': 'Waste loaded onto collection vehicle.',
          Completed: 'Delivered to sorting & upcycling depot.',
        };

        return {
          ...p,
          status: newStatus,
          assignedWorker,
          timeline: [
            ...p.timeline,
            {
              status: newStatus,
              timestamp: now,
              note: note || descriptions[newStatus],
              actor: currentUser.name || (role === 'admin' ? 'Logistics Control Desk' : 'Field Staff'),
            },
          ],
        };
      })
    );

    showToast(`Pickup #${id} marked as ${newStatus}`, 'success');

    // Persist status update to Firestore
    if (auth.currentUser) {
      const targetPickup = pickups.find((p) => p.id === id);
      if (targetPickup) {
        setDoc(doc(db, 'pickups', id), { ...targetPickup, status: newStatus, updatedAt: now }, { merge: true })
          .catch((err) => handleFirestoreError(err, OperationType.WRITE, `pickups/${id}`));
      }
    }
  };

  const assignPickupWorker = (pickupId: string, workerId: string) => {
    updatePickupStatus(pickupId, 'Assigned', undefined, workerId);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resetToDefaultDemoData = () => {
    setComplaints([]);
    setPickups([]);
    setWorkers([]);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.PICKUPS);
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    showToast('Local cache cleared', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        role,
        setRole,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        complaints,
        pickups,
        workers,
        notifications,
        toast,
        showToast,
        hideToast,
        selectedComplaintId,
        setSelectedComplaintId,
        selectedPickupId,
        setSelectedPickupId,
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        t,
        createComplaint,
        updateComplaintStatus,
        assignComplaintWorker,
        createPickupRequest,
        updatePickupStatus,
        assignPickupWorker,
        markNotificationRead,
        resetToDefaultDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
