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

        var veiculoId = pacotes.First().VeiculoId;

        // Verificar se todos os pacotes são do mesmo veículo
        if (pacotes.Any(p => p.VeiculoId != veiculoId))
        {
            return BadRequest("Todos os pacotes devem ser do mesmo veículo.");
        }

        // Verificar se o veículo existe
        if (!await _veiculoRepository.ExistsAsync(veiculoId))
        {
            return NotFound($"Veículo com ID {veiculoId} não encontrado.");
        }

        var pacotesSalvos = new List<VeiculoPacotePortal>();

        foreach (var pacoteDto in pacotes)
        {
            // Verificar se já existe um pacote para este portal
            var pacoteExistente = await _context.VeiculosPacotesPortais
                .FirstOrDefaultAsync(p => p.VeiculoId == pacoteDto.VeiculoId &&
                                         p.TipoPortal == pacoteDto.TipoPortal);

            if (pacoteExistente != null)
            {
                // Atualizar pacote existente
                pacoteExistente.TipoPacote = pacoteDto.TipoPacote;
                pacotesSalvos.Add(pacoteExistente);
            }
            else
            {
                // Criar novo pacote
                var novoPacote = _mapper.Map<VeiculoPacotePortal>(pacoteDto);
                _context.VeiculosPacotesPortais.Add(novoPacote);
                pacotesSalvos.Add(novoPacote);
            }
        }

        await _context.SaveChangesAsync();

        var pacotesSalvosDto = _mapper.Map<IEnumerable<VeiculoPacotePortalDto>>(pacotesSalvos);
        return Ok(pacotesSalvosDto);
    }
}