using Microsoft.EntityFrameworkCore;
using AdsetVeiculos.API.Domain.Entities;
using AdsetVeiculos.API.Domain.Interfaces;
using AdsetVeiculos.API.Infrastructure.Data;

namespace AdsetVeiculos.API.Infrastructure.Repositories;

public class OpcionalRepository : IOpcionalRepository
{
    private readonly VeiculosDbContext _context;

    public OpcionalRepository(VeiculosDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Opcional>> GetAllAsync()
    {
        return await _context.Opcionais
            .OrderBy(o => o.Nome)
            .ToListAsync();
    }

    public async Task<IEnumerable<Opcional>> GetAllAtivosAsync()
    {
        return await _context.Opcionais
            .OrderBy(o => o.Nome)
            .ToListAsync();
    }

    public async Task<Opcional?> GetByIdAsync(int id)
    {
        return await _context.Opcionais.FindAsync(id);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Opcionais.AnyAsync(o => o.Id == id);
    }
}