using Microsoft.EntityFrameworkCore;
using AdsetVeiculos.API.Domain.Entities;
using AdsetVeiculos.API.Domain.Interfaces;
using AdsetVeiculos.API.Infrastructure.Data;

namespace AdsetVeiculos.API.Infrastructure.Repositories;

public class VeiculoRepository : IVeiculoRepository
{
    private readonly VeiculosDbContext _context;

    public VeiculoRepository(VeiculosDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Veiculo>> GetAllAsync()
    {
        return await _context.Veiculos
            .Include(v => v.Fotos)
            .Include(v => v.Opcionais)
                .ThenInclude(vo => vo.Opcional)
            .Include(v => v.PacotesPortais)
            .OrderByDescending(v => v.DataCadastro)
            .ToListAsync();
    }

    public async Task<Veiculo?> GetByIdAsync(int id)
    {
        return await _context.Veiculos
            .Include(v => v.Fotos)
            .Include(v => v.Opcionais)
                .ThenInclude(vo => vo.Opcional)
            .Include(v => v.PacotesPortais)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Veiculo?> GetByPlacaAsync(string placa)
    {
        return await _context.Veiculos
            .Include(v => v.Fotos)
            .Include(v => v.Opcionais)
                .ThenInclude(vo => vo.Opcional)
            .Include(v => v.PacotesPortais)
            .FirstOrDefaultAsync(v => v.Placa == placa);
    }

    public async Task<Veiculo> AddAsync(Veiculo veiculo)
    {
        _context.Veiculos.Add(veiculo);
        await _context.SaveChangesAsync();
        return veiculo;
    }

    public async Task<Veiculo> UpdateAsync(Veiculo veiculo)
    {
        veiculo.DataAtualizacao = DateTime.UtcNow;
        _context.Entry(veiculo).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return veiculo;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var veiculo = await _context.Veiculos.FindAsync(id);
        if (veiculo == null)
            return false;

        _context.Veiculos.Remove(veiculo);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Veiculos.AnyAsync(v => v.Id == id);
    }

    public async Task<bool> PlacaExistsAsync(string placa, int? excludeId = null)
    {
        var query = _context.Veiculos.Where(v => v.Placa == placa);

        if (excludeId.HasValue)
            query = query.Where(v => v.Id != excludeId.Value);

        return await query.AnyAsync();
    }

    public async Task<IEnumerable<Veiculo>> GetByFiltrosAsync(string? marca = null, string? modelo = null, int? anoMin = null, int? anoMax = null, decimal? precoMin = null, decimal? precoMax = null)
    {
        var query = _context.Veiculos
            .Include(v => v.Fotos)
            .Include(v => v.Opcionais)
                .ThenInclude(vo => vo.Opcional)
            .Include(v => v.PacotesPortais)
            .AsQueryable();

        if (!string.IsNullOrEmpty(marca))
            query = query.Where(v => v.Marca.Contains(marca));

        if (!string.IsNullOrEmpty(modelo))
            query = query.Where(v => v.Modelo.Contains(modelo));

        if (anoMin.HasValue)
            query = query.Where(v => v.Ano >= anoMin.Value);

        if (anoMax.HasValue)
            query = query.Where(v => v.Ano <= anoMax.Value);

        if (precoMin.HasValue)
            query = query.Where(v => v.Preco >= precoMin.Value);

        if (precoMax.HasValue)
            query = query.Where(v => v.Preco <= precoMax.Value);

        return await query.OrderByDescending(v => v.DataCadastro).ToListAsync();
    }
}