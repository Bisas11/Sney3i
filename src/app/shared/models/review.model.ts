export interface Review {
  id: string;
  service_request_id: string;
  client_id: string;
  score: number;
  commentaire?: string;
  created_at: string;
  deleted_at?: string;
  // relations
  service_request?: {
    id: string;
    service?: {
      id: string;
      title: string;
    };
  };
  client?: {
    id: string;
    name: string;
    image_url?: string;
  };
}
