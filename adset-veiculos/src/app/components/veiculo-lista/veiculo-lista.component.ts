import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VeiculoService } from '../../services/veiculo.service';
import { ActionsService } from '../../services/actions.service';
import { Veiculo, FiltroVeiculo, UpdateVeiculoDto } from '../../models/veiculo.model';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { VeiculoFormComponent } from '../veiculo-form/veiculo-form.component';

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

  constructor(private service: VeiculoService, private actions: ActionsService, private router: Router, private dialog: MatDialog) {
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
    });
  }

  buscar() {
    this.service.buscarVeiculos(this.filtro).subscribe(veiculos => {
      this.filtrados = veiculos;
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
    this.filtrados.forEach(v => {
      const updateDto: UpdateVeiculoDto = {
        marca: v.marca,
        modelo: v.modelo,
        ano: v.ano,
        placa: v.placa,
        km: v.km,
        cor: v.cor,
        preco: v.preco,
        opcionaisIds: v.opcionais?.map(o => o.id) || [],
        fotos: [] // Não há arquivos para upload neste contexto
      };
      this.service.updateVeiculo(v.id, updateDto).subscribe();
    });
    this.refresh();
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

  // Métodos para gerenciar portais e pacotes
  alternarPortal(veiculo: Veiculo, portal: 'icarros' | 'webmotors') {
    veiculo.portalAtivo = portal;
  }

  alterarPacote(veiculo: Veiculo, portal: 'icarros' | 'webmotors', pacote: string, event: any) {
    const isChecked = event.target.checked;
    if (portal === 'icarros' && veiculo.icarros) {
      (veiculo.icarros as any)[pacote] = isChecked;
    } else if (portal === 'webmotors' && veiculo.webmotors) {
      (veiculo.webmotors as any)[pacote] = isChecked;
    }
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
    this.service.deleteVeiculo(id).subscribe(() => {
      this.refresh();
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

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
