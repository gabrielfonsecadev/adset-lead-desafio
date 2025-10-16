using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using AdsetVeiculos.API.Domain.Interfaces;
using AdsetVeiculos.API.Application.DTOs;

namespace AdsetVeiculos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OpcionaisController : ControllerBase
{
    private readonly IOpcionalRepository _opcionalRepository;
    private readonly IMapper _mapper;

    public OpcionaisController(IOpcionalRepository opcionalRepository, IMapper mapper)
    {
        _opcionalRepository = opcionalRepository;
        _mapper = mapper;
    }

    /// <summary>
    /// Obtém todos os opcionais
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OpcionalDto>>> List()
    {
        var opcionais = await _opcionalRepository.GetAllAsync();
        var opcionaisDto = _mapper.Map<IEnumerable<OpcionalDto>>(opcionais);
        return Ok(opcionaisDto);
    }
}