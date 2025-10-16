using AdsetVeiculos.API.Domain.Enums;

namespace AdsetVeiculos.API.Domain.Entities;

public class VeiculoPacotePortal
{
    public int Id { get; set; }

    public int VeiculoId { get; set; }

    public TipoPortal TipoPortal { get; set; }

    public TipoPacote TipoPacote { get; set; }

    // Relacionamento
    public virtual Veiculo Veiculo { get; set; } = null!;
}