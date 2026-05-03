export interface PrestataireProfile {
  id: string;
  user_id: string;
  application_status: 'pending' | 'approved' | 'rejected';
  title?: string;
  bio?: string;
  rejection_reason?: string;
  rejected_at?: string;
  reapplication_count: number;
  doc_validation: boolean;
  created_at?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image_url?: string;
  };
  documents?: {
    id: string;
    doc_url: string;
    doc_type: 'id_card' | 'diploma' | 'certificate' | 'other';
  }[];
}

/** @deprecated Use Service from service.model.ts instead */
export interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

/** @deprecated Use PrestataireProfile instead */
export interface Provider {
  id: string;
  userId: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  avatar: string;
  photos: string[];
  services: ProviderService[];
  verified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  serviceArea?: string;
  availability?: string;
}
