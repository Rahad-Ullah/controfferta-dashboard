export interface Category {
  _id: string;
  name: string;
  description: string;
  iconUrl: string;
  creditCost: number;
  totalLeads: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryQuery {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

export interface CategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}
