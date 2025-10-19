import { Injectable } from '@angular/core';
import { IPaginationService, PaginationConfig, PaginationResult } from '../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class PaginationService implements IPaginationService {

  constructor() { }

  /**
   * Pagina uma lista de itens
   */
  paginate<T>(items: T[], config: PaginationConfig): PaginationResult<T> {
    const totalPages = Math.ceil(items.length / config.pageSize);
    const start = (config.currentPage - 1) * config.pageSize;
    const paginatedItems = items.slice(start, start + config.pageSize);

    return {
      items: paginatedItems,
      totalPages,
      currentPage: config.currentPage,
      hasNext: config.currentPage < totalPages,
      hasPrevious: config.currentPage > 1
    };
  }

  /**
   * Gera números de páginas para exibição na interface
   */
  getPaginationNumbers(currentPage: number, totalPages: number): (number | string)[] {
    const pages: (number | string)[] = [];

    if (totalPages <= 10) {
      // Se temos 10 páginas ou menos, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com reticências
      if (currentPage <= 4) {
        // Início: 1, 2, 3, 4, 5, ..., última
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Final: 1, ..., n-4, n-3, n-2, n-1, n
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., última
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }

  /**
   * Navega para primeira página
   */
  goToFirstPage(): number {
    return 1;
  }

  /**
   * Navega para última página
   */
  goToLastPage(totalPages: number): number {
    return totalPages;
  }

  /**
   * Navega para página anterior
   */
  goToPreviousPage(currentPage: number): number {
    return currentPage > 1 ? currentPage - 1 : currentPage;
  }

  /**
   * Navega para próxima página
   */
  goToNextPage(currentPage: number, totalPages: number): number {
    return currentPage < totalPages ? currentPage + 1 : currentPage;
  }

  /**
   * Valida se uma página é válida
   */
  isValidPage(page: number, totalPages: number): boolean {
    return page >= 1 && page <= totalPages;
  }
}