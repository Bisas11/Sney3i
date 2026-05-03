export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin' | 'prestataire';
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  image_url?: string;
  is_active: boolean;
  is_suspended: boolean;
  is_email_verified: boolean;
  created_at?: string;
  prestataire_application?: PrestataireApplication;
}

export interface PrestataireApplication {
  status: 'pending' | 'approved' | 'rejected';
  title?: string | null;
  bio?: string | null;
  doc_validation?: boolean;
  rejection_reason?: string | null;
  rejected_at?: string | null;
  reapplication_count: number;
  can_apply: boolean;
  cooldown: {
    is_on_cooldown: boolean;
    retry_at: string | null;
    remaining_seconds: number;
    remaining_minutes: number;
    rejection_reason: string | null;
  };
}

export interface ApplicationDocument {
  id: string;
  doc_url: string;
  doc_type: 'id_card' | 'diploma' | 'certificate' | 'other';
}
