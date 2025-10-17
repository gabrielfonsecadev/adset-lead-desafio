import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { VeiculoService } from '../../services/veiculo.service';
import { ActionsService } from '../../services/actions.service';
import { FiltroVeiculo } from '../../models/veiculo.model';
import { VeiculoFormComponent } from '../veiculo-form/veiculo-form.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('dropdownAnim', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class HeaderComponent {
  total = 0;
  comFotos = 0;
  semFotos = 0;
  showFiltros = false;
  filtro: FiltroVeiculo = { precoFaixa: '', fotos: '' };
  anos: number[] = [];
  cores: string[] = [];

  constructor(private veiculos: VeiculoService, private router: Router, private actions: ActionsService, private dialog: MatDialog) {
    this.veiculos.getEstatisticas().subscribe(e => {
      this.total = e.total;
      this.comFotos = e.comFotos;
      this.semFotos = e.semFotos;
    });
    this.anos = Array.from({ length: 25 }, (_, i) => 2000 + i);
    this.veiculos.getCoresDistinct().subscribe(cores => {
      this.cores = cores;
    });
  }

  cadastrar() {
    const dialogRef = this.dialog.open(VeiculoFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { veiculo: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Atualizar estatísticas após cadastro
        this.veiculos.getEstatisticas().subscribe(e => {
          this.total = e.total;
          this.comFotos = e.comFotos;
          this.semFotos = e.semFotos;
        });
      }
    });
  }

  salvar() {
    this.actions.emitirSalvar();
  }

  toggleFiltros() {
    this.showFiltros = !this.showFiltros;
  }

  buscar() {
    this.actions.emitirBuscar(this.filtro);
  }

  limparFiltros() {
    this.filtro = {
      placa: '',
      marca: '',
      modelo: '',
      anoMin: undefined,
      anoMax: undefined,
      precoFaixa: '',
      fotos: '',
      cor: '',
      opcionaisTexto: ''
    };
  }
}
