using AdsetVeiculos.API.Domain.Enums;

namespace AdsetVeiculos.API.Application.DTOs;

public class VeiculoDto
{
    public int Id { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Ano { get; set; }
    public string Placa { get; set; } = string.Empty;
    public int? Km { get; set; }
    public string Cor { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public DateTime DataCadastro { get; set; }
    public DateTime? DataAtualizacao { get; set; }

    public List<VeiculoFotoDto> Fotos { get; set; } = new();
    public List<OpcionalDto> Opcionais { get; set; } = new();
    public List<VeiculoPacotePortalDto> PacotesPortais { get; set; } = new();
}

public class CreateVeiculoDto
{
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Ano { get; set; }
    public string Placa { get; set; } = string.Empty;
    public int? Km { get; set; }
    public string Cor { get; set; } = string.Empty;
    public decimal Preco { get; set; }

    public List<int> OpcionaisIds { get; set; } = new();
    public List<CreateVeiculoFotoDto> Fotos { get; set; } = new();
}

public class UpdateVeiculoDto
{
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Ano { get; set; }
    public string Placa { get; set; } = string.Empty;
    public int? Km { get; set; }
    public string Cor { get; set; } = string.Empty;
    public decimal Preco { get; set; }

    public List<int> OpcionaisIds { get; set; } = new();
    public List<CreateVeiculoFotoDto> Fotos { get; set; } = new();
    public List<int> FotosParaRemover { get; set; } = new();
}

public class VeiculoFotoDto
{
    public int Id { get; set; }
    public string ImagemBase64 { get; set; } = string.Empty;
    public string? NomeArquivo { get; set; }
    public int Ordem { get; set; }
    public DateTime DataUpload { get; set; }
}

public class OpcionalDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}

public class VeiculoPacotePortalDto
{
    public int Id { get; set; }
    public TipoPortal TipoPortal { get; set; }
    public TipoPacote TipoPacote { get; set; }
}

public class SalvarPacotePortalDto
{
    public int VeiculoId { get; set; }
    public TipoPortal TipoPortal { get; set; }
    public TipoPacote TipoPacote { get; set; }
}

public class CreateVeiculoFotoDto
{
    public string ImagemBase64 { get; set; } = string.Empty;
    public string? NomeArquivo { get; set; }
    public int? Id { get; set; }
    public int Ordem { get; set; }
}