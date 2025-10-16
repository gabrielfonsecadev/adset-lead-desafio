using Microsoft.AspNetCore.Mvc;
using AdsetVeiculos.API.Domain.Interfaces;
using AdsetVeiculos.API.Application.DTOs;
using AutoMapper;
using FluentValidation;
using AdsetVeiculos.API.Infrastructure.Data;
using AdsetVeiculos.API.Domain.Entities;
using System.Text.Json;

namespace AdsetVeiculos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VeiculosController : ControllerBase
{
    private readonly IVeiculoRepository _veiculoRepository;
    private readonly IOpcionalRepository _opcionalRepository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateVeiculoDto> _createValidator;
    private readonly IValidator<UpdateVeiculoDto> _updateValidator;
    private readonly VeiculosDbContext _context;

    public VeiculosController(
        IVeiculoRepository veiculoRepository,
        IOpcionalRepository opcionalRepository,
        IMapper mapper,
        IValidator<CreateVeiculoDto> createValidator,
        IValidator<UpdateVeiculoDto> updateValidator,
        VeiculosDbContext context)
    {
        _veiculoRepository = veiculoRepository;
        _opcionalRepository = opcionalRepository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _context = context;
    }

    /// <summary>
    /// Obtém todos os veículos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeiculoDto>>> GetVeiculos()
    {
        var veiculos = await _veiculoRepository.GetAllAsync();
        var veiculosDto = _mapper.Map<IEnumerable<VeiculoDto>>(veiculos);

        return Ok(veiculosDto);
    }

    /// <summary>
    /// Obtém um veículo por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VeiculoDto>> GetVeiculo(int id)
    {
        var veiculo = await _veiculoRepository.GetByIdAsync(id);
        if (veiculo == null)
        {
            return NotFound($"Veículo com ID {id} não encontrado.");
        }

        var veiculoDto = _mapper.Map<VeiculoDto>(veiculo);

        return Ok(veiculoDto);
    }

    /// <summary>
    /// Busca veículos por filtros
    /// </summary>
    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<VeiculoDto>>> BuscarVeiculos(
        [FromQuery] string? marca = null,
        [FromQuery] string? modelo = null,
        [FromQuery] int? anoMin = null,
        [FromQuery] int? anoMax = null,
        [FromQuery] decimal? precoMin = null,
        [FromQuery] decimal? precoMax = null)
    {
        var veiculos = await _veiculoRepository.GetByFiltrosAsync(marca, modelo, anoMin, anoMax, precoMin, precoMax);
        var veiculosDto = _mapper.Map<IEnumerable<VeiculoDto>>(veiculos);

        return Ok(veiculosDto);
    }

    /// <summary>
    /// Cria um novo veículo
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VeiculoDto>> CreateVeiculo(CreateVeiculoDto createVeiculoDto)
    {
        var validationResult = await _createValidator.ValidateAsync(createVeiculoDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        // Verificar se a placa já existe
        if (await _veiculoRepository.PlacaExistsAsync(createVeiculoDto.Placa))
        {
            return BadRequest($"Já existe um veículo cadastrado com a placa {createVeiculoDto.Placa}.");
        }

        // Verificar se os opcionais existem
        if (createVeiculoDto.OpcionaisIds.Any())
        {
            foreach (var opcionalId in createVeiculoDto.OpcionaisIds)
            {
                if (!await _opcionalRepository.ExistsAsync(opcionalId))
                {
                    return BadRequest($"Opcional com ID {opcionalId} não encontrado.");
                }
            }
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var veiculo = _mapper.Map<Veiculo>(createVeiculoDto);

            // Adicionar fotos
            foreach (var fotoDto in createVeiculoDto.Fotos)
            {
                veiculo.Fotos.Add(new VeiculoFoto
                {
                    ImagemBase64 = fotoDto.ImagemBase64,
                    NomeArquivo = fotoDto.NomeArquivo,
                    Ordem = fotoDto.Ordem,
                    DataUpload = DateTime.UtcNow
                });
            }

            var veiculoCriado = await _veiculoRepository.AddAsync(veiculo);

            // Confirmar transação se tudo ocorreu bem
            await transaction.CommitAsync();

            var veiculoDto = _mapper.Map<VeiculoDto>(veiculoCriado);

            return CreatedAtAction(nameof(GetVeiculo), new { id = veiculoCriado.Id }, veiculoDto);
        }
        catch (Exception)
        {
            // Rollback automático em caso de erro
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Atualiza um veículo existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<VeiculoDto>> UpdateVeiculo(int id, UpdateVeiculoDto updateVeiculoDto)
    {
        var validationResult = await _updateValidator.ValidateAsync(updateVeiculoDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var veiculoExistente = await _veiculoRepository.GetByIdAsync(id);
        if (veiculoExistente == null)
        {
            return NotFound($"Veículo com ID {id} não encontrado.");
        }

        // Verificar se a placa já existe (excluindo o veículo atual)
        if (await _veiculoRepository.PlacaExistsAsync(updateVeiculoDto.Placa, id))
        {
            return BadRequest($"Já existe outro veículo cadastrado com a placa {updateVeiculoDto.Placa}.");
        }

        // Verificar se os opcionais existem
        if (updateVeiculoDto.OpcionaisIds.Any())
        {
            foreach (var opcionalId in updateVeiculoDto.OpcionaisIds)
            {
                if (!await _opcionalRepository.ExistsAsync(opcionalId))
                {
                    return BadRequest($"Opcional com ID {opcionalId} não encontrado.");
                }
            }
        }

        // Atualizar propriedades básicas
        _mapper.Map(updateVeiculoDto, veiculoExistente);

        // Iniciar transação para garantir consistência dos dados
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Atualizar opcionais (remover todos e adicionar os novos)
            veiculoExistente.Opcionais.Clear();
            foreach (var opcionalId in updateVeiculoDto.OpcionaisIds)
            {
                veiculoExistente.Opcionais.Add(new VeiculoOpcional
                {
                    VeiculoId = id,
                    OpcionalId = opcionalId
                });
            }

            // Remover fotos especificadas
            if (updateVeiculoDto.FotosParaRemover.Any())
            {
                var fotosParaRemover = veiculoExistente.Fotos
                    .Where(f => updateVeiculoDto.FotosParaRemover.Contains(f.Id))
                    .ToList();

                foreach (var foto in fotosParaRemover)
                {
                    veiculoExistente.Fotos.Remove(foto);
                }
            }

            // Adicionar novas fotos
            foreach (var fotoDto in updateVeiculoDto.Fotos)
            {
                if (fotoDto.Id > 0)
                {
                    continue;
                }
                veiculoExistente.Fotos.Add(new VeiculoFoto
                {
                    VeiculoId = id,
                    ImagemBase64 = fotoDto.ImagemBase64,
                    NomeArquivo = fotoDto.NomeArquivo,
                    Ordem = fotoDto.Ordem,
                    DataUpload = DateTime.UtcNow
                });
            }

            var veiculoAtualizado = await _veiculoRepository.UpdateAsync(veiculoExistente);

            // Confirmar transação se tudo ocorreu bem
            await transaction.CommitAsync();

            var veiculoDto = _mapper.Map<VeiculoDto>(veiculoAtualizado);

            return Ok(veiculoDto);
        }
        catch (Exception)
        {
            // Rollback automático em caso de erro
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Exclui um veículo
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVeiculo(int id)
    {
        if (!await _veiculoRepository.ExistsAsync(id))
        {
            return NotFound($"Veículo com ID {id} não encontrado.");
        }

        var sucesso = await _veiculoRepository.DeleteAsync(id);
        if (!sucesso)
        {
            return BadRequest("Erro ao excluir o veículo.");
        }

        return NoContent();
    }


}