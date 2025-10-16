using AdsetVeiculos.API.Domain.Entities;

namespace AdsetVeiculos.API.Domain.Interfaces;

public interface IOpcionalRepository
{
    Task<IEnumerable<Opcional>> GetAllAsync();
    Task<IEnumerable<Opcional>> GetAllAtivosAsync();
    Task<Opcional?> GetByIdAsync(int id);
    Task<bool> ExistsAsync(int id);
}