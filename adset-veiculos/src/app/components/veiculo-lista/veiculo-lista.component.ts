import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VeiculoService } from '../../services/veiculo.service';
import { ActionsService } from '../../services/actions.service';
import { PacotePortalService } from '../../services/pacote-portal.service';
import { SortingService, SortConfig } from '../../services/sorting.service';
import { Veiculo, FiltroVeiculo, InsertUpdVeiculoDto, TipoPortal, TipoPacote } from '../../models/veiculo.model';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { VeiculoFormComponent } from '../veiculo-form/veiculo-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService } from '../../services/confirmation.service';
import { PaginationService } from '../../services/pagination.service';
import { VehiclePackageService } from '../../services/vehicle-package.service';
import { IPaginationService } from '../../interfaces/pagination.interface';
import { IVehiclePackageService } from '../../interfaces/vehicle-package.interface';

@Component({
  selector: 'app-veiculo-lista',
  templateUrl: './veiculo-lista.component.html',
  styleUrls: ['./veiculo-lista.component.scss']
})
export class VeiculoListaComponent implements OnInit, OnDestroy {
  Math = Math;
  veiculos: Veiculo[] = [];
  filtrados: Veiculo[] = [];
  cores: string[] = [];
  anos: number[] = [];
  filtro: FiltroVeiculo = { precoFaixa: '', fotos: '' };
  page = 1;
  pageSize = 1;
  sub: Subscription;

  // Propriedades para ordenação
  ordenacaoAtiva = '';
  sortConfig = { field: 'marca', direction: 'asc' as 'asc' | 'desc' };

  get direcaoOrdenacao() {
    return this.sortConfig.direction;
  }

  constructor(
    private service: VeiculoService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService,
    private actionsService: ActionsService,
    private pacotePortalService: PacotePortalService,
    private sortingService: SortingService,
    private paginationService: PaginationService,
    private vehiclePackageService: VehiclePackageService
  ) {
    this.anos = Array.from({ length: 25 }, (_, i) => 2000 + i);
    this.refresh();
    this.sub = new Subscription();
    this.sub.add(this.actionsService.salvar$.subscribe(() => this.onSalvar()));
    this.sub.add(this.actionsService.buscar$.subscribe(f => {
      this.filtro = { ...f };
      this.buscar();
    }));
  }

  ngOnInit() {
    // Implementação do OnInit se necessário
  }

  // getVeiculos() {
  //   this.service.getVeiculos().subscribe(res => {
  //     this.veiculos = res;
  //     this.filtrados = [...this.veiculos];
  //     this.cores = [...new Set(this.veiculos.map(v => v.cor))];
  //   });
  // }

  refresh() {
    this.service.getVeiculos().subscribe(veiculos => {
      this.veiculos = veiculos;
      this.filtrados = [...veiculos];
      
      // Extrair cores únicas
      const coresSet = new Set<string>();
      veiculos.forEach(veiculo => {
        if (veiculo.cor) {
          coresSet.add(veiculo.cor);
        }
      });
      this.cores = Array.from(coresSet).sort();

      // Usar o novo serviço para processar pacotes
      this.vehiclePackageService.processVehiclePackages(this.filtrados);
    });
  }

  buscar() {
    this.service.buscarVeiculos(this.filtro).subscribe(veiculos => {
      this.veiculos = veiculos;
      
      // Aplica ordenação se configurada
      if (this.sortConfig.field) {
        this.filtrados = this.sortingService.sortArray(this.veiculos, this.sortConfig);
      } else {
        this.filtrados = [...veiculos];
      }
      
      this.cores = [...new Set(this.veiculos.map(v => v.cor))];
      this.vehiclePackageService.processVehiclePackages(this.filtrados);
      
      // Reset para primeira página
      this.page = 1;
    });
  }

  editar(v: Veiculo) {
    this.router.navigate(['/cadastro', v.id]);
  }

  excluir(v: Veiculo) {
    this.service.deleteVeiculo(v.id).subscribe(() => {
      this.refresh();
    });
  }

  onSalvar() {
    // Verificar se há diferenças nos pacotes antes de salvar
    const hasChanges = this.vehiclePackageService.hasPackageChanges(this.filtrados);
    
    if (!hasChanges) {
      this.snackBar.open('Nenhuma alteração nos pacotes foi detectada.', 'Fechar', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    // Usar o novo serviço para coletar e salvar pacotes
    const todosPacotes = this.vehiclePackageService.collectAllPackagesFromVehicles(this.filtrados);
    
    this.vehiclePackageService.saveMultiplePackages(todosPacotes, this.filtrados).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open(result.message, 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open(result.message, 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  // Métodos simplificados usando VehiclePackageService
  setPacoteICarros(v: Veiculo, p: string) { 
    this.vehiclePackageService.setICarrosPackage(v, p);
  }
  
  setPacoteWebMotors(v: Veiculo, p: string) { 
    this.vehiclePackageService.setWebMotorsPackage(v, p);
  }

  // Métodos de paginação usando PaginationService
  get paginaAtual() { return this.page; }
  get totalPaginas() { return Math.ceil(this.filtrados.length / this.pageSize); }

  irParaPrimeiraPagina() { 
    this.page = this.paginationService.goToFirstPage();
  }
  
  irParaUltimaPagina() { 
    this.page = this.paginationService.goToLastPage(this.totalPaginas);
  }
  
  paginaAnterior() { 
    this.page = this.paginationService.goToPreviousPage(this.page);
  }
  
  proximaPagina() { 
    this.page = this.paginationService.goToNextPage(this.page, this.totalPaginas);
  }
  
  irParaPagina(pagina: number) { 
    if (this.paginationService.isValidPage(pagina, this.totalPaginas)) {
      this.page = pagina;
    }
  }

  navegarParaPagina(pagina: number) {
    this.irParaPagina(pagina);
  }

  alterarPacote(veiculo: Veiculo, portal: 'icarros' | 'webmotors', pacote: string, event: any) {
    const isChecked = event.target.checked;
    this.vehiclePackageService.changeVehiclePackage(veiculo, portal, pacote, isChecked);
  }

  // Métodos para ações dos veículos
  editarVeiculo(id: number) {
    this.service.getVeiculo(id).subscribe(veiculo => {
      const dialogRef = this.dialog.open(VeiculoFormComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: { veiculo: veiculo }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.refresh();
        }
      });
    });
  }

  excluirVeiculo(id: number) {
    const confirmation = this.confirmationService.open({
      title: 'Atenção!',
      message: 'Você tem certeza de que deseja excluir este veículo permanentemente?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === true) {
        this.service.deleteVeiculo(id).subscribe({
          next: () => {
            this.snackBar.open('Veículo excluído com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.refresh();
          },
          error: (error) => {
            console.error('Erro ao excluir veículo:', error);
            this.snackBar.open('Erro ao excluir veículo. Tente novamente.', 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  // Método para obter páginas visíveis na paginação
  getPaginasVisiveis(): (number | string)[] {
    return this.paginationService.getPaginationNumbers(this.page, this.totalPaginas);
  }

  get paged() {
    const paginationResult = this.paginationService.paginate(this.filtrados, {
      currentPage: this.page,
      pageSize: this.pageSize,
      totalItems: this.filtrados.length
    });
    return paginationResult.items;
  }

  getPaginationNumbers(): (number | string)[] {
    return this.paginationService.getPaginationNumbers(this.page, this.totalPaginas);
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.irParaPagina(page);
    }
  }

  // Métodos de ordenação
  ordenarPor(campo: string) {
    if (this.ordenacaoAtiva === campo) {
      // Se já está ordenando por este campo, inverte a direção
      this.sortConfig.direction = this.sortingService.toggleDirection(this.sortConfig.direction);
    } else {
      // Se é um novo campo, define como crescente
      this.ordenacaoAtiva = campo;
      this.sortConfig = { field: campo, direction: 'asc' };
    }

    this.buscar();
  }

  atualizarPaginacao() {
    this.page = 1;
  }

  limparOrdenacao() {
    this.ordenacaoAtiva = '';
    this.sortConfig = { field: '', direction: 'asc' };
    this.buscar();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
