import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Veiculo } from '../models/veiculo.model';
import { PacotePortalService } from './pacote-portal.service';
import { IVehiclePackageService, PackageUpdateResult } from '../interfaces/vehicle-package.interface';

@Injectable({
  providedIn: 'root'
})
export class VehiclePackageService implements IVehiclePackageService {

  constructor(private pacotePortalService: PacotePortalService) { }

  /**
   * Processa pacotes de veículos convertendo do backend para frontend
   */
  processVehiclePackages(vehicles: Veiculo[]): void {
    vehicles.forEach(vehicle => {
      // Converter pacotes que já vêm do backend para o formato do frontend
      if (vehicle.pacotesPortais && vehicle.pacotesPortais.length > 0) {
        const { icarros, webmotors } = this.pacotePortalService.converterPacotesParaFrontend(vehicle.pacotesPortais);
        vehicle.icarros = icarros;
        vehicle.webmotors = webmotors;
      } else {
        // Inicializar com valores padrão se não houver pacotes
        vehicle.icarros = { basico: false, bronze: false, diamante: false, platinum: false };
        vehicle.webmotors = { basico: false, bronze: false, diamante: false, platinum: false };
      }
    });
  }

  /**
   * Altera pacote de um veículo com exclusão mútua
   */
  changeVehiclePackage(
    vehicle: Veiculo, 
    portal: 'icarros' | 'webmotors', 
    packageType: string, 
    isChecked: boolean
  ): void {
    if (portal === 'icarros' && vehicle.icarros) {
      // Desmarcar todos os outros pacotes do iCarros
      this.clearAllPackages(vehicle.icarros);

      // Marcar apenas o pacote selecionado se foi marcado
      if (isChecked) {
        (vehicle.icarros as any)[packageType] = true;
      }
    } else if (portal === 'webmotors' && vehicle.webmotors) {
      // Desmarcar todos os outros pacotes do WebMotors
      this.clearAllPackages(vehicle.webmotors);

      // Marcar apenas o pacote selecionado se foi marcado
      if (isChecked) {
        (vehicle.webmotors as any)[packageType] = true;
      }
    }
  }

  /**
   * Coleta todos os pacotes de múltiplos veículos para salvamento
   */
  collectAllPackagesFromVehicles(vehicles: Veiculo[]): any[] {
    const allPackages: any[] = [];

    vehicles.forEach(vehicle => {
      const vehiclePackages = this.pacotePortalService.converterPacotesParaBackend(
        vehicle.id,
        vehicle.icarros,
        vehicle.webmotors
      );
      allPackages.push(...vehiclePackages);
    });

    return allPackages;
  }

  /**
   * Salva múltiplos pacotes e atualiza os veículos
   */
  saveMultiplePackages(
    packages: any[], 
    vehicles: Veiculo[]
  ): Observable<PackageUpdateResult> {
    return new Observable(observer => {
      if (packages.length === 0) {
        observer.next({ success: true, message: 'Nenhum pacote para salvar' });
        observer.complete();
        return;
      }

      this.pacotePortalService.salvarMultiplosPacotes(packages).subscribe({
        next: (savedPackages) => {
          // Primeiro, limpar todos os pacotes dos veículos que foram afetados
          const affectedVehicleIds = [...new Set(packages.map(p => p.veiculoId))];
          
          vehicles.forEach(vehicle => {
            if (affectedVehicleIds.includes(vehicle.id)) {
              vehicle.pacotesPortais = [];
            }
          });

          // Agora adicionar apenas os pacotes salvos
          savedPackages.forEach(package_ => {
            const vehicle = vehicles.find(v => v.id === package_.veiculoId);
            if (vehicle) {
              if (!vehicle.pacotesPortais) {
                vehicle.pacotesPortais = [];
              }
              vehicle.pacotesPortais.push(package_);
            }
          });

          // Reprocessar os pacotes para atualizar o formato do frontend
          this.processVehiclePackages(vehicles);

          observer.next({
            success: true,
            message: 'Pacotes salvos com sucesso!',
            updatedVehicles: vehicles
          });
          observer.complete();
        },
        error: (error) => {
          observer.next({
            success: false,
            message: 'Erro ao salvar pacotes. Tente novamente.'
          });
          observer.complete();
        }
      });
    });
  }

  /**
   * Define pacote específico para iCarros
   */
  setICarrosPackage(vehicle: Veiculo, packageType: string): void {
    vehicle.pacoteICarros = packageType;
  }

  /**
   * Define pacote específico para WebMotors
   */
  setWebMotorsPackage(vehicle: Veiculo, packageType: string): void {
    vehicle.pacoteWebMotors = packageType;
  }

  /**
   * Limpa todos os pacotes de um portal
   */
  private clearAllPackages(portalPackages: any): void {
    portalPackages.basico = false;
    portalPackages.bronze = false;
    portalPackages.diamante = false;
    portalPackages.platinum = false;
  }

  /**
   * Compara os pacotes atuais com os novos para verificar se há diferenças
   */
  hasPackageChanges(vehicles: Veiculo[]): boolean {
    for (const vehicle of vehicles) {
      // Obter pacotes atuais do backend (pacotesPortais)
      const currentPackages = vehicle.pacotesPortais || [];
      
      // Converter pacotes atuais para o formato frontend para comparação
      const { icarros: currentIcarros, webmotors: currentWebmotors } = 
        this.pacotePortalService.converterPacotesParaFrontend(currentPackages);
      
      // Comparar com os pacotes do frontend (que podem ter sido modificados)
      const frontendIcarros = vehicle.icarros || { basico: false, bronze: false, diamante: false, platinum: false };
      const frontendWebmotors = vehicle.webmotors || { basico: false, bronze: false, diamante: false, platinum: false };
      
      // Verificar se há diferenças nos pacotes do iCarros
      if (this.arePackagesDifferent(currentIcarros, frontendIcarros)) {
        return true;
      }
      
      // Verificar se há diferenças nos pacotes do WebMotors
      if (this.arePackagesDifferent(currentWebmotors, frontendWebmotors)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Compara dois objetos de pacotes para verificar se são diferentes
   */
  private arePackagesDifferent(current: any, frontend: any): boolean {
    const packageTypes = ['basico', 'bronze', 'diamante', 'platinum'];
    
    for (const packageType of packageTypes) {
      if (current[packageType] !== frontend[packageType]) {
        return true;
      }
    }
    
    return false;
  }
}