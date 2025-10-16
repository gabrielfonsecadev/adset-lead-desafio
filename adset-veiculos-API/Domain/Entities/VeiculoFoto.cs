using System.ComponentModel.DataAnnotations;

namespace AdsetVeiculos.API.Domain.Entities;

public class VeiculoFoto
{
    public int Id { get; set; }

    public int VeiculoId { get; set; }

    [Required]
    public string ImagemBase64 { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? NomeArquivo { get; set; }

    public int Ordem { get; set; }

    public DateTime DataUpload { get; set; } = DateTime.UtcNow;

    // Relacionamento
    public virtual Veiculo Veiculo { get; set; } = null!;
}