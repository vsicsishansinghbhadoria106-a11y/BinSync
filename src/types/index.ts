export type UserRole = 'citizen' | 'admin' | 'worker';

export interface UserProfile {
  uid: string;
  name: string;
  role: UserRole;
  email?: string;
  mobile?: string;
  phone?: string;
  area?: string;
  address?: string;
  idProofType?: string;
  idProofNumber?: string;
  avatar?: string;
  badgeId?: string;
  unit?: string;
  zone?: string;
  department?: string;
  designation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'pending_verification'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ComplaintCategory =
  | 'Overflowing Bin'
  | 'Illegal Dumping'
  | 'Broken Bin'
  | 'Hazardous Waste'
  | 'Bio-Waste'
  | 'Uncollected Garbage'
  | 'Other';

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorRole: 'Citizen' | 'Admin' | 'Worker' | 'System';
}

export interface Complaint {
  id: string; // e.g. WM-2026-00125
  title: string;
  category: ComplaintCategory;
  location: string;
  area?: string;
  addressDetails?: string;
  coordinates?: { lat: number; lng: number };
  priority: ComplaintPriority;
  description: string;
  status: ComplaintStatus;
  reporterName: string;
  reporterEmail?: string;
  reporterPhone?: string;
  reporterId?: string;
  citizenId?: string;
  citizenName?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerBadge?: string;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedWorker?: {
    id: string;
    name: string;
    phone?: string;
    unit?: string;
    badge?: string;
    email?: string;
  };
  beforePhotoUrl?: string;
  beforeImageUrl?: string;
  afterPhotoUrl?: string;
  afterImageUrl?: string;
  adminNotes?: string;
  citizenFeedback?: {
    rating?: number;
    confirmed: boolean;
    comment?: string;
  };
  timeline: TimelineEvent[];
}

export type PickupWasteType =
  | 'Dry Waste'
  | 'E-Waste'
  | 'Hazardous'
  | 'Organic Waste'
  | 'Bulk Furniture';

export type PickupStatus =
  | 'Requested'
  | 'Scheduled'
  | 'Assigned'
  | 'Picked Up'
  | 'Completed';

export interface PickupTimelineEvent {
  status: PickupStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface PickupRequest {
  id: string;
  wasteType: PickupWasteType;
  scheduledDate: string;
  timeSlot: string;
  status: PickupStatus;
  address: string;
  area: string;
  estimatedWeight?: string;
  specialInstructions?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  requesterId?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  createdAt: string;
  updatedAt?: string;
  assignedWorker?: {
    id: string;
    name: string;
    phone?: string;
    truckId?: string;
    unit?: string;
  };
  timeline: PickupTimelineEvent[];
}

export interface MunicipalWorker {
  id: string;
  name: string;
  email?: string;
  gender?: 'male' | 'female';
  badge?: string;
  unit: string;
  active?: boolean;
  phone?: string;
  zone?: string;
  status?: 'Available' | 'On Duty' | 'Busy';
  assignedTasks?: number;
  completedTasks?: number;
  rating?: number;
  uid?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  linkId?: string;
}
