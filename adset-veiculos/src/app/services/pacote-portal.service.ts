import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VeiculoPacotePortalDto, SalvarPacotePortalDto, TipoPortal, TipoPacote } from '../models/veiculo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacotePortalService {
  private apiUrl = `${environment.apiUrl}/api/PacotesPortais`;

  constructor(private http: HttpClient) { }

  /**
   * Salva um pacote para um portal específico de um veículo
   */
  salvarPacotePortal(pacote: SalvarPacotePortalDto): Observable<VeiculoPacotePortalDto> {
    return this.http.post<VeiculoPacotePortalDto>(`${this.apiUrl}/salvar`, pacote);
  }

  /**
   * Salva múltiplos pacotes de uma vez
   */
  salvarMultiplosPacotes(pacotes: SalvarPacotePortalDto[]): Observable<VeiculoPacotePortalDto[]> {
    return this.http.post<VeiculoPacotePortalDto[]>(`${this.apiUrl}/salvar-multiplos`, pacotes);
  }

  /**
   * Obtém todos os pacotes de portais de um veículo
   */
  getPacotesVeiculo(veiculoId: number): Observable<VeiculoPacotePortalDto[]> {
    return this.http.get<VeiculoPacotePortalDto[]>(`${this.apiUrl}/veiculo/${veiculoId}`);
  }

  /**
   * Remove um pacote de portal
   */
  removerPacotePortal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Converte os pacotes do formato do backend para o formato usado no frontend
   */
  converterPacotesParaFrontend(pacotes: VeiculoPacotePortalDto[]): { icarros: any, webmotors: any } {
    const icarros = {
      basico: false,
      bronze: false,
      diamante: false,
      platinum: false
    };

    const webmotors = {
      basico: false,
      bronze: false,
      diamante: false,
      platinum: false
    };

    pacotes.forEach(pacote => {
      const tipoPacoteNome = this.getTipoPacoteNome(pacote.tipoPacote);
      
      if (pacote.tipoPortal === TipoPortal.ICarros) {
        (icarros as any)[tipoPacoteNome] = true;
      } else if (pacote.tipoPortal === TipoPortal.WebMotors) {
        (webmotors as any)[tipoPacoteNome] = true;
      }
    });

    return { icarros, webmotors };
  }

  /**
   * Converte os pacotes do formato do frontend para o formato do backend
   */
  converterPacotesParaBackend(veiculoId: number, icarros: any, webmotors: any): SalvarPacotePortalDto[] {
    const pacotes: SalvarPacotePortalDto[] = [];

    // Processar pacotes do iCarros
    if (icarros) {
      Object.keys(icarros).forEach(tipoPacote => {
        if (icarros[tipoPacote]) {
          pacotes.push({
            veiculoId,
            tipoPortal: TipoPortal.ICarros,
            tipoPacote: this.getTipoPacoteEnum(tipoPacote)
          });
        }
      });
    }

    // Processar pacotes do WebMotors
    if (webmotors) {
      Object.keys(webmotors).forEach(tipoPacote => {
        if (webmotors[tipoPacote]) {
          pacotes.push({
            veiculoId,
            tipoPortal: TipoPortal.WebMotors,
            tipoPacote: this.getTipoPacoteEnum(tipoPacote)
          });
        }
      });
    }

    return pacotes;
  }

  /**
   * Converte o enum TipoPacote para string
   */
  private getTipoPacoteNome(tipoPacote: TipoPacote): string {
    switch (tipoPacote) {
      case TipoPacote.Basico: return 'basico';
      case TipoPacote.Bronze: return 'bronze';
      case TipoPacote.Diamante: return 'diamante';
      case TipoPacote.Platinum: return 'platinum';
      default: return 'basico';
    }
  }

  /**
   * Converte string para enum TipoPacote
   */
  private getTipoPacoteEnum(tipoPacote: string): TipoPacote {
    switch (tipoPacote.toLowerCase()) {
      case 'basico': return TipoPacote.Basico;
      case 'bronze': return TipoPacote.Bronze;
      case 'diamante': return TipoPacote.Diamante;
      case 'platinum': return TipoPacote.Platinum;
      default: return TipoPacote.Basico;
    }
  }
}