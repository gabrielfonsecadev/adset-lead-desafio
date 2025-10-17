using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AdsetVeiculos.API.Domain.Entities;
using AdsetVeiculos.API.Domain.Interfaces;
using AdsetVeiculos.API.Application.DTOs;
using AdsetVeiculos.API.Infrastructure.Data;

namespace AdsetVeiculos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PacotesPortaisController : ControllerBase
{
    private readonly IVeiculoRepository _veiculoRepository;
    private readonly VeiculosDbContext _context;
    private readonly IMapper _mapper;

    public PacotesPortaisController(
        IVeiculoRepository veiculoRepository,
        VeiculosDbContext context,
        IMapper mapper)
    {
        _veiculoRepository = veiculoRepository;
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Salva o pacote selecionado para um portal específico de um veículo
    /// </summary>
    [HttpPost("salvar")]
    public async Task<ActionResult<VeiculoPacotePortalDto>> SalvarPacotePortal(SalvarPacotePortalDto salvarPacoteDto)
    {
        // Verificar se o veículo existe
        if (!await _veiculoRepository.ExistsAsync(salvarPacoteDto.VeiculoId))
        {
            return NotFound($"Veículo com ID {salvarPacoteDto.VeiculoId} não encontrado.");
        }

        // Verificar se já existe um pacote para este veículo e portal
        var pacoteExistente = await _context.VeiculosPacotesPortais
            .FirstOrDefaultAsync(p => p.VeiculoId == salvarPacoteDto.VeiculoId &&
                                     p.TipoPortal == salvarPacoteDto.TipoPortal);

        if (pacoteExistente != null)
        {
            // Atualizar pacote existente
            pacoteExistente.TipoPacote = salvarPacoteDto.TipoPacote;

            _context.VeiculosPacotesPortais.Update(pacoteExistente);
            await _context.SaveChangesAsync();

            var pacoteAtualizadoDto = _mapper.Map<VeiculoPacotePortalDto>(pacoteExistente);
            return Ok(pacoteAtualizadoDto);
        }
        else
        {
            // Criar novo pacote
            var novoPacote = _mapper.Map<VeiculoPacotePortal>(salvarPacoteDto);

            _context.VeiculosPacotesPortais.Add(novoPacote);
            await _context.SaveChangesAsync();

            var novoPacoteDto = _mapper.Map<VeiculoPacotePortalDto>(novoPacote);
            return CreatedAtAction(nameof(GetPacotesVeiculo), new { veiculoId = novoPacote.VeiculoId }, novoPacoteDto);
        }
    }

    /// <summary>
    /// Obtém todos os pacotes de portais de um veículo
    /// </summary>
    [HttpGet("veiculo/{veiculoId}")]
    public async Task<ActionResult<IEnumerable<VeiculoPacotePortalDto>>> GetPacotesVeiculo(int veiculoId)
    {
        if (!await _veiculoRepository.ExistsAsync(veiculoId))
        {
            return NotFound($"Veículo com ID {veiculoId} não encontrado.");
        }

        var pacotes = await _context.VeiculosPacotesPortais
            .Where(p => p.VeiculoId == veiculoId)
            .ToListAsync();

        var pacotesDto = _mapper.Map<IEnumerable<VeiculoPacotePortalDto>>(pacotes);
        return Ok(pacotesDto);
    }

    /// <summary>
    /// Remove um pacote de portal de um veículo
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoverPacotePortal(int id)
    {
        var pacote = await _context.VeiculosPacotesPortais.FindAsync(id);

        if (pacote == null)
        {
            return NotFound($"Pacote com ID {id} não encontrado.");
        }

        _context.VeiculosPacotesPortais.Remove(pacote);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Salva múltiplos pacotes de uma vez (para quando o usuário clica em "Salvar" na tela)
    /// </summary>
    [HttpPost("salvar-multiplos")]
    public async Task<ActionResult<IEnumerable<VeiculoPacotePortalDto>>> SalvarMultiplosPacotes(
        [FromBody] List<SalvarPacotePortalDto> pacotes)
    {
        if (!pacotes.Any())
        {
            return BadRequest("Nenhum pacote foi informado.");
        }

        // Verificar se todos os veículos existem
        var veiculosIds = pacotes.Select(p => p.VeiculoId).Distinct().ToList();
        foreach (var veiculoId in veiculosIds)
        {
            if (!await _veiculoRepository.ExistsAsync(veiculoId))
            {
                return NotFound($"Veículo com ID {veiculoId} não encontrado.");
            }
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var pacotesSalvos = new List<VeiculoPacotePortal>();

            // Primeiro, remover todos os pacotes existentes dos veículos afetados
            var pacotesExistentes = await _context.VeiculosPacotesPortais
                .Where(p => veiculosIds.Contains(p.VeiculoId))
                .ToListAsync();
            
            _context.VeiculosPacotesPortais.RemoveRange(pacotesExistentes);

            // Agora adicionar os novos pacotes
            foreach (var pacoteDto in pacotes)
            {
                var novoPacote = _mapper.Map<VeiculoPacotePortal>(pacoteDto);
                _context.VeiculosPacotesPortais.Add(novoPacote);
                pacotesSalvos.Add(novoPacote);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var pacotesSalvosDto = _mapper.Map<IEnumerable<VeiculoPacotePortalDto>>(pacotesSalvos);
            return Ok(pacotesSalvosDto);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
        }
    }
}