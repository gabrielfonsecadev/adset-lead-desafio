using AutoMapper;
using AdsetVeiculos.API.Domain.Entities;
using AdsetVeiculos.API.Application.DTOs;

namespace AdsetVeiculos.API.Application.Mappings;

public class VeiculoMappingProfile : Profile
{
    public VeiculoMappingProfile()
    {
        // Veiculo mappings
        CreateMap<Veiculo, VeiculoDto>()
            .ForMember(dest => dest.Opcionais, opt => opt.MapFrom(src => src.Opcionais.Select(vo => vo.Opcional)));

        CreateMap<CreateVeiculoDto, Veiculo>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.DataCadastro, opt => opt.Ignore())
            .ForMember(dest => dest.DataAtualizacao, opt => opt.Ignore())
            .ForMember(dest => dest.Fotos, opt => opt.Ignore())
            .ForMember(dest => dest.Opcionais, opt => opt.Ignore())
            .ForMember(dest => dest.PacotesPortais, opt => opt.Ignore());

        CreateMap<UpdateVeiculoDto, Veiculo>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.DataCadastro, opt => opt.Ignore())
            .ForMember(dest => dest.DataAtualizacao, opt => opt.Ignore())
            .ForMember(dest => dest.Fotos, opt => opt.Ignore())
            .ForMember(dest => dest.Opcionais, opt => opt.Ignore())
            .ForMember(dest => dest.PacotesPortais, opt => opt.Ignore());

        // VeiculoFoto mappings
        CreateMap<VeiculoFoto, VeiculoFotoDto>();

        // Opcional mappings
        CreateMap<Opcional, OpcionalDto>();

        // VeiculoPacotePortal mappings
        CreateMap<VeiculoPacotePortal, VeiculoPacotePortalDto>();
        CreateMap<SalvarPacotePortalDto, VeiculoPacotePortal>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Veiculo, opt => opt.Ignore());
    }
}