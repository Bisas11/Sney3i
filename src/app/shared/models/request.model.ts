export type ServiceRequestStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'done' | 'cancelled';

export interface ServiceRequest {
  id: string;
  service_id: string;
  client_id: string;
  prestataire_id: string;
  status: ServiceRequestStatus;
  client_message?: string;
  /** Raw entity timestamp (present in transition responses) */
  created_at?: string;
  updated_at?: string;
  /** History endpoint maps created_at to start_date */
  start_date?: string;

  // ── History endpoint flags ────────────────────────────────
  can_cancel?: boolean;
  can_review?: boolean;
  /** review_id is set when status=done and a review exists */
  review_id?: string | null;

  // ── Missions endpoint flags ───────────────────────────────
  allowed_next_statuses?: ServiceRequestStatus[];

  // ── History endpoint: top-level flat prestataire object ───
  prestataire?: {
    id: string;
    name: string;
    email: string;
    phone_number?: string | null;
    image_url?: string | null;
  };

  // ── Both endpoints: service (without nested prestataire) ──
  service?: {
    id: string;
    title: string;
    description?: string;
    price?: string;
    image_url?: string | null;
  };

  // ── Missions endpoint: top-level flat client object ───────
  client?: {
    id: string;
    name: string;
    email?: string;
    phone_number?: string | null;
    image_url?: string | null;
  };
}
