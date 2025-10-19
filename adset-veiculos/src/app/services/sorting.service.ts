import { Injectable } from '@angular/core';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }

  /**
   * Alterna a direção de ordenação
   */
  toggleDirection(currentDirection: 'asc' | 'desc'): 'asc' | 'desc' {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Ordena um array de objetos baseado na configuração fornecida
   */
  sortArray<T>(items: T[], config: SortConfig): T[] {
    if (!config.field) {
      return items;
    }

    return [...items].sort((a: any, b: any) => {
      const aValue = this.getNestedProperty(a, config.field);
      const bValue = this.getNestedProperty(b, config.field);

      // Tratamento para valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return config.direction === 'asc' ? -1 : 1;
      if (bValue == null) return config.direction === 'asc' ? 1 : -1;

      // Comparação de strings (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return config.direction === 'asc' ? comparison : -comparison;
      }

      // Comparação numérica
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Comparação de datas
      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return config.direction === 'asc' ? comparison : -comparison;
      }

      // Comparação padrão convertendo para string
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return config.direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Obtém propriedade aninhada de um objeto usando notação de ponto
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : null;
    }, obj);
  }
}