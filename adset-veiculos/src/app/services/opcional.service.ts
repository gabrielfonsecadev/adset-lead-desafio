import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OpcionalDto } from '../models/veiculo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OpcionalService {
  private apiUrl = `${environment.apiUrl}/api/Opcionais`;
  private opcionais: OpcionalDto[] = [];
  private opcionaisSubject = new BehaviorSubject<OpcionalDto[]>([]);
  opcionais$ = this.opcionaisSubject.asObservable();
  private dadosCarregados = false;

  constructor(private http: HttpClient) {
    this.inicializarDados();
  }

  private inicializarDados(): void {
    if (!this.dadosCarregados) {
      this.getOpcionais().subscribe(opcionais => {
        this.opcionais = opcionais;
        this.opcionaisSubject.next([...this.opcionais]);
        this.dadosCarregados = true;
      });
    }
  }

  getOpcionais(): Observable<OpcionalDto[]> {
    return this.http.get<OpcionalDto[]>(this.apiUrl);
  }

  getOpcional(id: number): Observable<OpcionalDto> {
    return this.http.get<OpcionalDto>(`${this.apiUrl}/${id}`);
  }

  // Método para obter opcionais carregados localmente
  getOpcionaisCarregados(): Observable<OpcionalDto[]> {
    if (this.dadosCarregados) {
      return this.opcionais$;
    } else {
      return this.opcionais$;
    }
  }
}
