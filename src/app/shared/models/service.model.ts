export interface Service {
  id: string;
  prestataire_id: string;
  sous_category_id?: string | null;
  title: string;
  description: string;
  /** Backend returns decimal as string e.g. "450.00" */
  price: string;
  image_url?: string | null;
  status: 'active' | 'paused' | 'suspended';
  created_at: string;
  updated_at?: string;
  /** Flat User entity — returned when service list includes the relation */
  prestataire?: {
    id: string;
    name: string;
    email?: string;
    phone_number?: string | null;
    address?: string | null;
    image_url?: string | null;
  };
  sous_category?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    };
  };
}

export interface ServiceListResponse {
  data: Service[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceDetailBase {
  search_mode: 'default' | 'ranked';
  reviews: ServiceReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceDetailFull extends ServiceDetailBase {
  service: Service;
  /** Flat User entity (not nested { user: { name } }) */
  prestataire: {
    id: string;
    name: string;
    email?: string;
    phone_number?: string | null;
    address?: string | null;
    image_url?: string | null;
  };
  review_summary: {
    /** Field name from backend is average_score */
    average_score: number;
    total: number;
  };
}

export type ServiceDetailResponse = ServiceDetailBase | ServiceDetailFull;

export interface ServiceReview {
  id: string;
  score: number;
  commentaire?: string;
  created_at: string;
  client: {
    id: string;
    name: string;
    image_url?: string;
  };
}
