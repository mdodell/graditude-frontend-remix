export interface RailsModel {
  id: string;
}

export interface WithPaginationMeta {
  pagination: {
    currentPage: number;
    nextPage: number;
    prevPage: null | number;
    totalPages: number;
    totalCount: number;
  };
}
