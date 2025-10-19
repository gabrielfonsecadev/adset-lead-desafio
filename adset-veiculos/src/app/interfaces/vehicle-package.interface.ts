import { Observable } from 'rxjs';
import { Veiculo } from '../models/veiculo.model';

export interface IVehiclePackageService {
  processVehiclePackages(vehicles: Veiculo[]): void;
  changeVehiclePackage(vehicle: Veiculo, portal: 'icarros' | 'webmotors', packageType: string, isChecked: boolean): void;
  collectAllPackagesFromVehicles(vehicles: Veiculo[]): any[];
  saveMultiplePackages(packages: any[], vehicles: Veiculo[]): Observable<PackageUpdateResult>;
  setICarrosPackage(vehicle: Veiculo, packageType: string): void;
  setWebMotorsPackage(vehicle: Veiculo, packageType: string): void;
  hasPackageChanges(vehicles: Veiculo[]): boolean;
}

export interface PackageUpdateResult {
  success: boolean;
  message: string;
  updatedVehicles?: Veiculo[];
}