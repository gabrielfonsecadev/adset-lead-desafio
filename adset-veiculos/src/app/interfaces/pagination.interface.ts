export interface IPaginationService {
  paginate<T>(items: T[], config: PaginationConfig): PaginationResult<T>;
  getPaginationNumbers(currentPage: number, totalPages: number): (number | string)[];
  goToFirstPage(): number;
  goToLastPage(totalPages: number): number;
  goToPreviousPage(currentPage: number): number;
  goToNextPage(currentPage: number, totalPages: number): number;
  isValidPage(page: number, totalPages: number): boolean;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}