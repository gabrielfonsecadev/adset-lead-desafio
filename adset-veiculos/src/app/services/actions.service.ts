import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FiltroVeiculo } from '../models/veiculo.model';

@Injectable({ providedIn: 'root' })
export class ActionsService {
  private salvarSubject = new Subject<void>();
  salvar$ = this.salvarSubject.asObservable();

  private buscarSubject = new Subject<FiltroVeiculo>();
  buscar$ = this.buscarSubject.asObservable();

  emitirSalvar() {
    this.salvarSubject.next();
  }

  emitirBuscar(filtro: FiltroVeiculo) {
    this.buscarSubject.next({ ...filtro });
  }
}