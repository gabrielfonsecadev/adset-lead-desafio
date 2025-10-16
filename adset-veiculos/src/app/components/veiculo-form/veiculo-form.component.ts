import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VeiculoService } from '../../services/veiculo.service';
import { OpcionalService } from '../../services/opcional.service';
import { Veiculo, CreateVeiculoDto, UpdateVeiculoDto, OpcionalDto, CreateVeiculoFotoDto } from '../../models/veiculo.model';

@Component({
  selector: 'app-veiculo-form',
  templateUrl: './veiculo-form.component.html',
  styleUrls: ['./veiculo-form.component.scss']
})
export class VeiculoFormComponent implements OnInit {
  anos = Array.from({ length: 25 }, (_, i) => 2000 + i);
  cores = ['Branco', 'Preto', 'Prata', 'Vermelho', 'Azul', 'Verde', 'Cinza'];
  opcionaisLista: OpcionalDto[] = [];
  fotosPreview: string[] = [];
  editId?: number;
  veiculo?: Veiculo;
  fotosToRemove: number[] = [];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: VeiculoService,
    private opcionalService: OpcionalService,
    public dialogRef: MatDialogRef<VeiculoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { veiculo?: Veiculo }
  ) {
    this.form = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: [undefined as unknown as number, Validators.required],
      placa: ['', Validators.required],
      km: [undefined as unknown as number],
      cor: ['', Validators.required],
      preco: [undefined as unknown as number, Validators.required],
      opcionaisIds: [[] as number[]],
      fotos: [[] as string[]]
    });
  }

  ngOnInit() {
    // Carregar opcionais do backend
    this.opcionalService.getOpcionaisCarregados().subscribe(opcionais => {
      this.opcionaisLista = opcionais;
    });

    if (this.data?.veiculo) {
      this.veiculo = this.data.veiculo;
      this.editId = this.veiculo.id;

      // Mapear opcionais para IDs
      const opcionaisIds = this.veiculo.opcionais?.map(o => o.id) || [];

      this.form.patchValue({
        marca: this.veiculo.marca,
        modelo: this.veiculo.modelo,
        ano: this.veiculo.ano,
        placa: this.veiculo.placa,
        km: this.veiculo.km,
        cor: this.veiculo.cor,
        preco: this.veiculo.preco,
        opcionaisIds: opcionaisIds,
        fotos: this.veiculo.fotos || []
      });

      // Manter preview das fotos existentes
      this.fotosPreview = this.veiculo.fotos?.map(f => f.imagemBase64) || [];
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFotosSelecionadas(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (files.length === 0) return;

    const atuais = this.fotosPreview.length;
    const disponiveis = 15 - atuais;

    if (disponiveis <= 0) {
      alert('Limite máximo de 15 fotos atingido!');
      return;
    }

    const selecionadas = files.slice(0, disponiveis);

    // Processar cada arquivo para criar preview e converter para Base64
    selecionadas.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.fotosPreview.push(result);
          const fotos = this.form.value.fotos || [];
          // Criar objeto foto para novas fotos (sem ID, pois são novas)
          const novaFoto = {
            imagemBase64: result,
            ordem: fotos.length + 1
          };
          this.form.patchValue({ fotos: [...fotos, novaFoto] });
        }
      };
      reader.readAsDataURL(file);
    });

    // Limpar o input para permitir selecionar os mesmos arquivos novamente se necessário
    input.value = '';

    if (selecionadas.length < files.length) {
      const naoAdicionadas = files.length - selecionadas.length;
      alert(`${naoAdicionadas} foto(s) não foram adicionadas devido ao limite de 15 fotos.`);
    }
  }

  removerFoto(idx: number) {
    // Verificar se a foto tem ID (foto existente) e adicionar à lista de remoção
    const fotos = this.form.value.fotos || [];
    const foto = fotos[idx];

    if (foto && foto.id) {
      this.fotosToRemove.push(foto.id);
    }

    // Remover da preview e do formulário
    this.fotosPreview.splice(idx, 1);
    fotos.splice(idx, 1);
    this.form.patchValue({ fotos: [...fotos] });
  }

  toggleOpcional(opcionalId: number, checked: boolean) {
    const opcionaisIds = this.form.value.opcionaisIds || [];
    if (checked) {
      if (!opcionaisIds.includes(opcionalId)) {
        this.form.patchValue({ opcionaisIds: [...opcionaisIds, opcionalId] });
      }
    } else {
      const filtered = opcionaisIds.filter((id: number) => id !== opcionalId);
      this.form.patchValue({ opcionaisIds: filtered });
    }
  }

  salvar() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // Preparar fotos para o DTO usando Base64
    const fotosDto: CreateVeiculoFotoDto[] = (formValue.fotos || []).map((foto: any, index: number) => ({
      imagemBase64: foto.imagemBase64,
      ordem: index + 1, // Sempre usar o índice atual para garantir ordem sequencial
      id: foto.id // Incluir ID se existir (para fotos existentes)
    }));

    if (this.editId) {
      // Atualização
      const updateDto: UpdateVeiculoDto = {
        marca: formValue.marca,
        modelo: formValue.modelo,
        ano: formValue.ano,
        placa: formValue.placa,
        km: formValue.km,
        cor: formValue.cor,
        preco: formValue.preco,
        opcionaisIds: formValue.opcionaisIds,
        fotos: fotosDto,
        fotosParaRemover: this.fotosToRemove
      };

      this.service.updateVeiculo(this.editId, updateDto).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      // Criação
      const createDto: CreateVeiculoDto = {
        marca: formValue.marca,
        modelo: formValue.modelo,
        ano: formValue.ano,
        placa: formValue.placa,
        km: formValue.km,
        cor: formValue.cor,
        preco: formValue.preco,
        opcionaisIds: formValue.opcionaisIds,
        fotos: fotosDto
      };

      this.service.addVeiculo(createDto).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
