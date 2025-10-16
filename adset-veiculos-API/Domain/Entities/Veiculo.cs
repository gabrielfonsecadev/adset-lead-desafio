using System.ComponentModel.DataAnnotations;

namespace AdsetVeiculos.API.Domain.Entities;

public class Veiculo
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Marca { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Modelo { get; set; } = string.Empty;
    
    [Required]
    public int Ano { get; set; }
    
    [Required]
    [MaxLength(10)]
    public string Placa { get; set; } = string.Empty;
    
    public int? Km { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Cor { get; set; } = string.Empty;
    
    [Required]
    public decimal Preco { get; set; }
    
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public DateTime? DataAtualizacao { get; set; }
    
    // Relacionamentos
    public virtual ICollection<VeiculoFoto> Fotos { get; set; } = new List<VeiculoFoto>();
    public virtual ICollection<VeiculoOpcional> Opcionais { get; set; } = new List<VeiculoOpcional>();
    public virtual ICollection<VeiculoPacotePortal> PacotesPortais { get; set; } = new List<VeiculoPacotePortal>();
}