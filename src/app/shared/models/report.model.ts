export interface Report {
  id: string;
  reporter_id: string;
  service_id?: string;
  review_id?: string;
  comment: string;
  status: 'unseen' | 'seen';
  created_at: string;
  updated_at?: string;
  // relations
  service?: {
    id: string;
    title: string;
  };
  review?: {
    id: string;
    commentaire?: string;
    score: number;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}
