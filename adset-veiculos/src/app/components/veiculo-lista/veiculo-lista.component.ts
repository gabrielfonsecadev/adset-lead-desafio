import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VeiculoService } from '../../services/veiculo.service';
import { ActionsService } from '../../services/actions.service';
import { PacotePortalService } from '../../services/pacote-portal.service';
import { Veiculo, FiltroVeiculo, InsertUpdVeiculoDto, TipoPortal, TipoPacote } from '../../models/veiculo.model';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { VeiculoFormComponent } from '../veiculo-form/veiculo-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-veiculo-lista',
  templateUrl: './veiculo-lista.component.html',
  styleUrls: ['./veiculo-lista.component.scss']
})
export class VeiculoListaComponent implements OnDestroy {
  Math = Math;
  veiculos: Veiculo[] = [];
  filtrados: Veiculo[] = [];
  cores: string[] = [];
  anos: number[] = [];
  filtro: FiltroVeiculo = { precoFaixa: '', fotos: '' };
  page = 1;
  pageSize = 1;
  sub: Subscription;

  constructor(private service: VeiculoService,
    private actions: ActionsService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService,
    private pacotePortalService: PacotePortalService) {
    this.anos = Array.from({ length: 25 }, (_, i) => 2000 + i);
    this.refresh();
    this.sub = new Subscription();
    this.sub.add(this.actions.salvar$.subscribe(() => this.onSalvar()));
    this.sub.add(this.actions.buscar$.subscribe(f => {
      this.filtro = { ...f };
      this.buscar();
    }));
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
      this.filtrados = [...this.veiculos];
      this.cores = [...new Set(this.veiculos.map(v => v.cor))];

      // Converter pacotes para o formato do frontend
      this.processarPacotesVeiculos(this.veiculos);
    });
  }

  buscar() {
    this.service.buscarVeiculos(this.filtro).subscribe(veiculos => {
      this.filtrados = veiculos;
      this.page = 1;

      // Converter pacotes para o formato do frontend
      this.processarPacotesVeiculos(this.filtrados);
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
    // Salvar dados dos veículos


    // Salvar pacotes de portais para todos os veículos
    this.salvarPacotesMultiplosVeiculos();

    this.refresh();
  }

  private salvarPacotesMultiplosVeiculos() {
    const todosPacotes: any[] = [];

    // Coletar todos os pacotes de todos os veículos filtrados
    this.filtrados.forEach(veiculo => {
      const pacotesVeiculo = this.pacotePortalService.converterPacotesParaBackend(
        veiculo.id,
        veiculo.icarros,
        veiculo.webmotors
      );
      todosPacotes.push(...pacotesVeiculo);
    });

    // Salvar todos os pacotes de uma vez se houver algum
    if (todosPacotes.length > 0) {
      this.pacotePortalService.salvarMultiplosPacotes(todosPacotes).subscribe({
        next: (pacotesSalvos) => {
          // Primeiro, limpar todos os pacotes dos veículos que foram afetados
          const veiculosAfetados = [...new Set(todosPacotes.map(p => p.veiculoId))];
          
          this.filtrados.forEach(veiculo => {
            if (veiculosAfetados.includes(veiculo.id)) {
              veiculo.pacotesPortais = [];
            }
          });

          // Agora adicionar apenas os pacotes salvos
          pacotesSalvos.forEach(pacote => {
            const veiculo = this.filtrados.find(v => v.id === pacote.veiculoId);
            if (veiculo) {
              if (!veiculo.pacotesPortais) {
                veiculo.pacotesPortais = [];
              }
              veiculo.pacotesPortais.push(pacote);
            }
          });

          // Reprocessar os pacotes para atualizar o formato do frontend
          this.processarPacotesVeiculos(this.filtrados);

          this.snackBar.open('Pacotes salvos com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Não fazer refresh completo, apenas atualizar a exibição
          // this.refresh();
        },
        error: (error) => {
          console.error('Erro ao salvar pacotes:', error);
          this.snackBar.open('Erro ao salvar pacotes. Tente novamente.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  setPacoteICarros(v: Veiculo, p: string) { v.pacoteICarros = p; }
  setPacoteWebMotors(v: Veiculo, p: string) { v.pacoteWebMotors = p; }

  // Propriedades para ordenação
  ordenacaoAtiva = '';
  direcaoOrdenacao: 'asc' | 'desc' = 'asc';

  // Propriedades para paginação
  get paginaAtual() { return this.page; }
  get totalPaginas() { return Math.ceil(this.filtrados.length / this.pageSize); }

  // Métodos para navegação de páginas
  irParaPrimeiraPagina() { this.page = 1; }
  irParaUltimaPagina() { this.page = this.totalPaginas; }
  paginaAnterior() { if (this.page > 1) this.page--; }
  proximaPagina() { if (this.page < this.totalPaginas) this.page++; }
  irParaPagina(pagina: number) { this.page = pagina; }



  alterarPacote(veiculo: Veiculo, portal: 'icarros' | 'webmotors', pacote: string, event: any) {
    const isChecked = event.target.checked;

    // Atualizar o estado local com exclusão mútua (apenas um pacote por portal)
    if (portal === 'icarros' && veiculo.icarros) {
      // Desmarcar todos os outros pacotes do iCarros
      veiculo.icarros.basico = false;
      veiculo.icarros.bronze = false;
      veiculo.icarros.diamante = false;
      veiculo.icarros.platinum = false;

      // Marcar apenas o pacote selecionado se foi marcado
      if (isChecked) {
        (veiculo.icarros as any)[pacote] = true;
      }
    } else if (portal === 'webmotors' && veiculo.webmotors) {
      // Desmarcar todos os outros pacotes do WebMotors
      veiculo.webmotors.basico = false;
      veiculo.webmotors.bronze = false;
      veiculo.webmotors.diamante = false;
      veiculo.webmotors.platinum = false;

      // Marcar apenas o pacote selecionado se foi marcado
      if (isChecked) {
        (veiculo.webmotors as any)[pacote] = true;
      }
    }

    // Não salvar automaticamente - será salvo pelo botão do header
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
    return this.getPaginationNumbers();
  }

  get paged() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtrados.slice(start, start + this.pageSize);
  }

  getPaginationNumbers(): (number | string)[] {
    const totalPages = Math.ceil(this.filtrados.length / this.pageSize);
    const current = this.page;
    const pages: (number | string)[] = [];

    if (totalPages <= 10) {
      // Se temos 10 páginas ou menos, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com reticências
      if (current <= 4) {
        // Início: 1, 2, 3, 4, 5, ..., última
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
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
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.page = page;
    }
  }

  // Métodos de ordenação
  ordenarPor(campo: string) {
    if (this.ordenacaoAtiva === campo) {
      // Se já está ordenando por este campo, inverte a direção
      this.direcaoOrdenacao = this.direcaoOrdenacao === 'asc' ? 'desc' : 'asc';
    } else {
      // Se é um novo campo, define como crescente
      this.ordenacaoAtiva = campo;
      this.direcaoOrdenacao = 'asc';
    }

    this.aplicarOrdenacao();
  }

  aplicarOrdenacao() {
    if (!this.ordenacaoAtiva) {
      this.filtrados = [...this.veiculos];
      return;
    }

    this.filtrados = [...this.veiculos].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.ordenacaoAtiva) {
        case 'marca':
          valorA = `${a.marca} ${a.modelo}`.toLowerCase();
          valorB = `${b.marca} ${b.modelo}`.toLowerCase();
          break;
        case 'ano':
          valorA = a.ano;
          valorB = b.ano;
          break;
        case 'preco':
          valorA = a.preco;
          valorB = b.preco;
          break;
        case 'fotos':
          valorA = a.fotos ? a.fotos.length : 0;
          valorB = b.fotos ? b.fotos.length : 0;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return this.direcaoOrdenacao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.direcaoOrdenacao === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Reset para primeira página após ordenação
    this.page = 1;
  }

  atualizarPaginacao() {
    this.page = 1;
  }

  limparOrdenacao() {
    this.ordenacaoAtiva = '';
    this.direcaoOrdenacao = 'asc';
    this.filtrados = [...this.veiculos];
    this.atualizarPaginacao();
  }

  private processarPacotesVeiculos(veiculos: Veiculo[]) {
    veiculos.forEach(veiculo => {
      // Converter pacotes que já vêm do backend para o formato do frontend
      if (veiculo.pacotesPortais && veiculo.pacotesPortais.length > 0) {
        const { icarros, webmotors } = this.pacotePortalService.converterPacotesParaFrontend(veiculo.pacotesPortais);
        veiculo.icarros = icarros;
        veiculo.webmotors = webmotors;
      } else {
        // Inicializar com valores padrão se não houver pacotes
        veiculo.icarros = { basico: false, bronze: false, diamante: false, platinum: false };
        veiculo.webmotors = { basico: false, bronze: false, diamante: false, platinum: false };
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
