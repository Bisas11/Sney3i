export interface ServiceCategory {
  id: string;
  name: string;
  status: boolean;
  sous_categories: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  category_id: string;
  status: boolean;
}
