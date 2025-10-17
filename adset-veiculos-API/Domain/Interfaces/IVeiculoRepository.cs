using AdsetVeiculos.API.Domain.Entities;

namespace AdsetVeiculos.API.Domain.Interfaces;

public interface IVeiculoRepository
{
    Task<IEnumerable<Veiculo>> GetAllAsync();
    Task<Veiculo?> GetByIdAsync(int id);
    Task<Veiculo?> GetByPlacaAsync(string placa);
    Task<Veiculo> AddAsync(Veiculo veiculo);
    Task<Veiculo> UpdateAsync(Veiculo veiculo);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> PlacaExistsAsync(string placa, int? excludeId = null);
    Task<IEnumerable<Veiculo>> GetByFiltrosAsync(string? placa = null, string? marca = null, string? modelo = null, int? anoMin = null, int? anoMax = null, decimal? precoMin = null, decimal? precoMax = null, string? opcionais = null, string? fotos = null, string? cor = null);
}