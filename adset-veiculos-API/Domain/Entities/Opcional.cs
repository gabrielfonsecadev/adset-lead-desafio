using System.ComponentModel.DataAnnotations;

namespace AdsetVeiculos.API.Domain.Entities;

public class Opcional
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    // Relacionamento
    public virtual ICollection<VeiculoOpcional> VeiculosOpcionais { get; set; } = new List<VeiculoOpcional>();
}