import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Veiculo, FiltroVeiculo, InsertUpdVeiculoDto } from '../models/veiculo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private apiUrl = `${environment.apiUrl}/api/Veiculos`;
  private veiculos: Veiculo[] = [];
  private veiculosSubject = new BehaviorSubject<Veiculo[]>([]);
  veiculos$ = this.veiculosSubject.asObservable();
  private dadosCarregados = false;

  constructor(private http: HttpClient) {
    this.inicializarDados();
  }

  private inicializarDados(): void {
    if (!this.dadosCarregados) {
      this.http.get<Veiculo[]>(this.apiUrl).subscribe(veiculos => {
        this.veiculos = veiculos;
        this.veiculosSubject.next([...this.veiculos]);
        this.dadosCarregados = true;
      });
    }
  }

  getVeiculos(): Observable<Veiculo[]> {
    if (this.dadosCarregados) {
      return this.veiculos$;
    } else {
      // Se os dados ainda não foram carregados, retorna o observable que será atualizado quando os dados chegarem
      return this.veiculos$;
    }
  }

  getVeiculo(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }

  addVeiculo(createVeiculoDto: InsertUpdVeiculoDto): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, createVeiculoDto).pipe(
      tap(novoVeiculo => {
        this.veiculos.push(novoVeiculo);
        this.veiculosSubject.next([...this.veiculos]);
      })
    );
  }

  updateVeiculo(id: number, updateVeiculoDto: InsertUpdVeiculoDto): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${id}`, updateVeiculoDto).pipe(
      tap(veiculoAtualizado => {
        const idx = this.veiculos.findIndex(v => v.id === id);
        if (idx !== -1) {
          this.veiculos[idx] = veiculoAtualizado;
          this.veiculosSubject.next([...this.veiculos]);
        }
      })
    );
  }

  deleteVeiculo(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const idx = this.veiculos.findIndex(v => v.id === id);
        if (idx !== -1) {
          this.veiculos.splice(idx, 1);
          this.veiculosSubject.next([...this.veiculos]);
          return true;
        }
        return false;
      })
    );
  }

  salvarPacotes(ids: number[], pacoteICarros: string | undefined, pacoteWebMotors: string | undefined) {
    const veiculosSelecionados = this.veiculos.filter(v => ids.includes(v.id));
    for (const veiculo of veiculosSelecionados) {
      if (pacoteICarros) veiculo.pacoteICarros = pacoteICarros;
      if (pacoteWebMotors) veiculo.pacoteWebMotors = pacoteWebMotors;
    }
    // this.persist();
  }

  // Métodos auxiliares que trabalham com cache local
  getMarcasDistinct(): Observable<string[]> {
    return this.veiculos$.pipe(
      map(veiculos => Array.from(new Set(veiculos.map(v => v.marca).filter(Boolean))).sort())
    );
  }

  getModelosDistinct(): Observable<string[]> {
    return this.veiculos$.pipe(
      map(veiculos => Array.from(new Set(veiculos.map(v => v.modelo).filter(Boolean))).sort())
    );
  }

  getCoresDistinct(): Observable<string[]> {
    return this.veiculos$.pipe(
      map(veiculos => Array.from(new Set(veiculos.map(v => v.cor).filter(Boolean))).sort())
    );
  }

  // Método de busca via API
  buscarVeiculos(filtro: FiltroVeiculo): Observable<Veiculo[]> {
    // Construir parâmetros de query baseados no filtro
    let params = new URLSearchParams();

    if (filtro.placa) {
      params.append('placa', filtro.placa);
    }
    if (filtro.marca) {
      params.append('marca', filtro.marca);
    }
    if (filtro.modelo) {
      params.append('modelo', filtro.modelo);
    }
    if (filtro.anoMin) {
      params.append('anoMin', filtro.anoMin.toString());
    }
    if (filtro.anoMax) {
      params.append('anoMax', filtro.anoMax.toString());
    }

    // Converter precoFaixa para precoMin e precoMax
    if (filtro.precoFaixa) {
      switch (filtro.precoFaixa) {
        case '10-50':
          params.append('precoMin', '10000');
          params.append('precoMax', '50000');
          break;
        case '50-90':
          params.append('precoMin', '50000');
          params.append('precoMax', '90000');
          break;
        case '90+':
          params.append('precoMin', '90000');
          break;
      }
    }
    if (filtro.fotos) {
      params.append('fotos', filtro.fotos);
    }
    if (filtro.cor) {
      params.append('cor', filtro.cor);
    }
    if (filtro.opcionaisTexto) {
      params.append('opcionais', filtro.opcionaisTexto);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl}/buscar?${queryString}` : `${this.apiUrl}/buscar`;

    return this.http.get<Veiculo[]>(url).pipe(
      tap(veiculos => {
        this.veiculos = veiculos;
        this.veiculosSubject.next([...this.veiculos]);
      })
    );
  }

  // Método de filtro local (para uso com cache)
  filtrarVeiculos(filtro: FiltroVeiculo): Veiculo[] {
    return this.veiculos.filter(v => {
      if (filtro.placa && !v.placa.toLowerCase().includes(filtro.placa.toLowerCase())) return false;
      if (filtro.marca && v.marca !== filtro.marca) return false;
      if (filtro.modelo && v.modelo !== filtro.modelo) return false;
      if (filtro.anoMin && v.ano < filtro.anoMin) return false;
      if (filtro.anoMax && v.ano > filtro.anoMax) return false;
      if (filtro.precoFaixa) {
        const p = v.preco;
        if (filtro.precoFaixa === '10-50' && !(p >= 10000 && p <= 50000)) return false;
        if (filtro.precoFaixa === '50-90' && !(p > 50000 && p <= 90000)) return false;
        if (filtro.precoFaixa === '90+' && !(p > 90000)) return false;
      }
      if (filtro.fotos === 'com' && !(v.fotos && v.fotos.length > 0)) return false;
      if (filtro.fotos === 'sem' && (v.fotos && v.fotos.length > 0)) return false;
      if (filtro.cor && v.cor !== filtro.cor) return false;
      if (filtro.opcionaisTexto) {
        const t = filtro.opcionaisTexto.toLowerCase();
        const ops = (v.opcionais || []).map(o => o.nome.toLowerCase());
        if (!ops.some(o => o.includes(t))) return false;
      }
      return true;
    });
  }

  getEstatisticas(): Observable<{total: number, comFotos: number, semFotos: number}> {
    return this.veiculos$.pipe(
      map(veiculos => {
        const total = veiculos.length;
        const comFotos = veiculos.filter(v => v.fotos && v.fotos.length > 0).length;
        const semFotos = total - comFotos;
        return { total, comFotos, semFotos };
      })
    );
  }
}
