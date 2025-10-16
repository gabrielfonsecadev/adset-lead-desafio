namespace AdsetVeiculos.API.Domain.Entities;

public class VeiculoOpcional
{
    public int VeiculoId { get; set; }
    public int OpcionalId { get; set; }

    // Relacionamentos
    public virtual Veiculo Veiculo { get; set; } = null!;
    public virtual Opcional Opcional { get; set; } = null!;
}