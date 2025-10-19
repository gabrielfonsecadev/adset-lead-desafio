import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeiculoService } from '../../services/veiculo.service';
import { OpcionalService } from '../../services/opcional.service';
import { Veiculo, InsertUpdVeiculoDto, OpcionalDto, CreateVeiculoFotoDto } from '../../models/veiculo.model';

// Interfaces para melhor organização (SRP)
interface FormValidationResult {
  isValid: boolean;
  message: string;
}

interface ImageProcessingResult {
  success: boolean;
  images: string[];
  message?: string;
}

interface ImageConstraints {
  maxFiles: number;
  maxSizeBytes: number;
  allowedTypes: string[];
}

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

  // Configurações centralizadas (OCP)
  private readonly imageConstraints: ImageConstraints = {
    maxFiles: 15,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  };

  constructor(
    private fb: FormBuilder,
    private service: VeiculoService,
    private opcionalService: OpcionalService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VeiculoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { veiculo?: Veiculo }
  ) {
    this.form = this.createVehicleForm();
  }

  ngOnInit() {
    this.loadOptionals();
    this.initializeFormData();
  }

  // SRP: Método específico para criar o formulário
  private createVehicleForm(): FormGroup {
    // Preparar fotos existentes com IDs preservados
    const fotosExistentes = this.veiculo?.fotos?.map(foto => ({
      id: foto.id,
      imagemBase64: foto.imagemBase64,
      nomeArquivo: foto.nomeArquivo,
      ordem: foto.ordem
    })) || [];

    return this.fb.group({
      marca: [this.veiculo?.marca || '', Validators.required],
      modelo: [this.veiculo?.modelo || '', Validators.required],
      ano: [this.veiculo?.ano || null, [Validators.required, this.yearValidator.bind(this)]],
      placa: [this.veiculo?.placa || '', Validators.required],
      km: [this.veiculo?.km || null, [Validators.min(0)]],
      cor: [this.veiculo?.cor || '', Validators.required],
      preco: [this.veiculo?.preco || null, [Validators.required, Validators.min(0.01)]],
      opcionaisIds: [this.veiculo?.opcionais?.map(o => o.id) || []],
      fotos: [fotosExistentes]
    });
  }

  // SRP: Validador customizado para ano
  private yearValidator(control: AbstractControl): ValidationErrors | null {
    const year = control.value;
    if (!year) return null;

    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    if (year < minYear || year > currentYear + 1) {
      return { invalidYear: { min: minYear, max: currentYear + 1, actual: year } };
    }

    return null;
  }

  // SRP: Carregamento de opcionais
  private loadOptionals(): void {
    this.opcionalService.getOpcionaisCarregados().subscribe(opcionais => {
      this.opcionaisLista = opcionais;
    });
  }

  // SRP: Inicialização dos dados do formulário
  private initializeFormData(): void {
    if (this.data?.veiculo) {
      this.veiculo = this.data.veiculo;
      this.editId = this.veiculo.id;
      this.populateFormWithVehicleData();
      this.form = this.createVehicleForm();
    }
  }

  // SRP: Preenchimento do formulário com dados do veículo
  private populateFormWithVehicleData(): void {
    if (!this.veiculo) return;

    this.fotosPreview = this.veiculo.fotos?.map(f => f.imagemBase64) || [];
  }

  // SRP: Validação completa do formulário
  private validateForm(): FormValidationResult {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return {
        isValid: false,
        message: 'Por favor, corrija os campos obrigatórios destacados'
      };
    }

    return { isValid: true, message: '' };
  }



  // SRP: Validação de arquivos de imagem
  private validateImageFiles(files: File[]): { valid: File[], invalid: File[], errors: string[] } {
    const valid: File[] = [];
    const invalid: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Validar tipo
      if (!this.imageConstraints.allowedTypes.includes(file.type)) {
        invalid.push(file);
        errors.push(`${file.name}: tipo não permitido`);
        return;
      }

      // Validar tamanho
      if (file.size > this.imageConstraints.maxSizeBytes) {
        invalid.push(file);
        errors.push(`${file.name}: arquivo muito grande (máx. 5MB)`);
        return;
      }

      valid.push(file);
    });

    return { valid, invalid, errors };
  }

  // SRP: Processamento de imagens
  private async processImages(files: File[]): Promise<ImageProcessingResult> {
    const currentCount = this.fotosPreview.length;
    const available = this.imageConstraints.maxFiles - currentCount;

    if (available <= 0) {
      return {
        success: false,
        images: [],
        message: `Limite máximo de ${this.imageConstraints.maxFiles} fotos atingido!`
      };
    }

    const validation = this.validateImageFiles(files);
    if (validation.errors.length > 0) {
      return {
        success: false,
        images: [],
        message: validation.errors.join(', ')
      };
    }

    const filesToProcess = validation.valid.slice(0, available);
    const processedImages: string[] = [];

    try {
      for (const file of filesToProcess) {
        const base64 = await this.fileToBase64(file);
        processedImages.push(base64);
      }

      const message = filesToProcess.length < files.length
        ? `${files.length - filesToProcess.length} foto(s) não foram adicionadas devido ao limite`
        : undefined;

      return {
        success: true,
        images: processedImages,
        message
      };
    } catch (error) {
      return {
        success: false,
        images: [],
        message: 'Erro ao processar imagens'
      };
    }
  }

  // SRP: Conversão de arquivo para Base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  // SRP: Criação de objeto foto
  private createPhotoObject(base64: string, order: number): any {
    return {
      imagemBase64: base64,
      ordem: order
    };
  }

  // SRP: Preparação de fotos para DTO
  private preparePhotosForDto(photos: any[]): CreateVeiculoFotoDto[] {
    return photos.map((foto, index) => ({
      imagemBase64: foto.imagemBase64,
      ordem: index + 1,
      id: foto.id
    }));
  }

  // Métodos públicos da interface

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async onFotosSelecionadas(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (files.length === 0) return;

    const result = await this.processImages(files);

    if (result.success) {
      result.images.forEach(base64Image => {
        this.fotosPreview.push(base64Image);
        const fotos = this.form.value.fotos || [];
        const novaFoto = this.createPhotoObject(base64Image, fotos.length + 1);
        this.form.patchValue({ fotos: [...fotos, novaFoto] });
      });

      if (result.message) {
        this.showMessage(result.message, 'warning');
      }
    } else {
      this.showMessage(result.message || 'Erro ao processar imagens', 'error');
    }

    input.value = '';
  }

  removerFoto(idx: number): void {
    const fotos = this.form.value.fotos || [];
    const foto = fotos[idx];

    // Verificar se a foto tem ID (foto existente no banco)
    if (foto && foto.id && foto.id > 0) {
      console.log('Adicionando foto para remoção:', foto.id);
      this.fotosToRemove.push(foto.id);
    }

    this.fotosPreview.splice(idx, 1);
    fotos.splice(idx, 1);

    // Reordenar fotos restantes
    fotos.forEach((f: any, i: number) => {
      f.ordem = i + 1;
    });

    this.form.patchValue({ fotos: [...fotos] });
    console.log('Array fotosToRemove:', this.fotosToRemove);
  }

  toggleOpcional(opcionalId: number, checked: boolean): void {
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

  salvar(): void {
    const validation = this.validateForm();

    if (!validation.isValid) {
      this.showMessage(validation.message, 'error');
      return;
    }

    const formValue = this.form.value;
    const veiculoDto = this.createVehicleDto(formValue);
    const fotosDto = this.preparePhotosForDto(formValue.fotos || []);

    if (this.editId) {
      this.updateVehicle(veiculoDto, fotosDto);
    } else {
      this.createVehicle(veiculoDto, fotosDto);
    }
  }

  // SRP: Criação do DTO do veículo
  private createVehicleDto(formValue: any): InsertUpdVeiculoDto {
    return {
      marca: formValue.marca,
      modelo: formValue.modelo,
      ano: formValue.ano,
      placa: formValue.placa,
      km: formValue.km || 0,
      cor: formValue.cor,
      preco: formValue.preco,
      opcionaisIds: formValue.opcionaisIds || [],
      fotos: [], // Será preenchido separadamente
      fotosParaRemover: this.fotosToRemove
    };
  }

  // SRP: Atualização de veículo
  private updateVehicle(veiculoDto: InsertUpdVeiculoDto, fotosDto: CreateVeiculoFotoDto[]): void {
    veiculoDto.fotos = fotosDto;
    veiculoDto.fotosParaRemover = this.fotosToRemove;

    console.log('Enviando para API - fotosParaRemover:', veiculoDto.fotosParaRemover);

    this.service.updateVeiculo(this.editId!, veiculoDto).subscribe({
      next: () => {
        this.showMessage('Veículo atualizado com sucesso!', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erro ao atualizar veículo:', error);
        this.showMessage('Erro ao atualizar veículo. Tente novamente.', 'error');
      }
    });
  }

  // SRP: Criação de veículo
  private createVehicle(veiculoDto: InsertUpdVeiculoDto, fotosDto: CreateVeiculoFotoDto[]): void {
    veiculoDto.fotos = fotosDto;

    this.service.addVeiculo(veiculoDto).subscribe({
      next: () => {
        this.showMessage('Veículo cadastrado com sucesso!', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erro ao cadastrar veículo:', error);
        this.showMessage('Erro ao cadastrar veículo. Tente novamente.', 'error');
      }
    });
  }

  // SRP: Exibição de mensagens
  private showMessage(message: string, type: 'success' | 'error' | 'warning'): void {
    const panelClass = [`${type}-snackbar`];
    const duration = type === 'error' ? 5000 : 3000;

    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
