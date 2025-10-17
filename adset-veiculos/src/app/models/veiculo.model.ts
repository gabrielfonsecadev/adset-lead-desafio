export interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  km?: number;
  cor: string;
  preco: number;
  opcionais?: OpcionalDto[];
  fotos?: VeiculoFotoDto[];
  pacotesPortais?: VeiculoPacotePortalDto[];
  dataCadastro?: string;
  dataAtualizacao?: string;
  // Propriedades para compatibilidade com o frontend atual
  pacoteICarros?: string;
  pacoteWebMotors?: string;
  portalAtivo?: 'icarros' | 'webmotors';
  icarros?: {
    bronze?: boolean;
    diamante?: boolean;
    platinum?: boolean;
    basico?: boolean;
  };
  webmotors?: {
    basico?: boolean;
    bronze?: boolean;
    diamante?: boolean;
    platinum?: boolean;
  };
}

export interface InsertUpdVeiculoDto {
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  km?: number;
  cor: string;
  preco: number;
  opcionaisIds: number[];
  fotos: CreateVeiculoFotoDto[];
  fotosParaRemover?: number[];
}

export interface CreateVeiculoFotoDto {
  imagemBase64: string;
  id?: number;
  ordem: number;
}

export interface VeiculoFotoDto {
  id: number;
  veiculoId: number;
  imagemBase64: string;
  nomeArquivo: string;
  ordem: number;
  dataUpload: string;
}

export interface OpcionalDto {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface VeiculoPacotePortalDto {
  id: number;
  veiculoId: number;
  tipoPortal: TipoPortal;
  tipoPacote: TipoPacote;
  dataSelecao?: string;
  dataAtualizacao?: string;
}

export interface SalvarPacotePortalDto {
  veiculoId: number;
  tipoPortal: TipoPortal;
  tipoPacote: TipoPacote;
}

export enum TipoPortal {
  ICarros = 1,
  WebMotors = 2
}

export enum TipoPacote {
  Basico = 1,
  Bronze = 2,
  Diamante = 3,
  Platinum = 4
}

export interface FiltroVeiculo {
  placa?: string;
  marca?: string;
  modelo?: string;
  anoMin?: number;
  anoMax?: number;
  precoFaixa?: '10-50' | '50-90' | '90+' | '';
  fotos?: 'com' | 'sem' | '';
  cor?: string;
  opcionaisTexto?: string;
}
