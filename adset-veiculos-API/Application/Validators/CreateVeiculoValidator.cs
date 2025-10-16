using FluentValidation;
using AdsetVeiculos.API.Application.DTOs;

namespace AdsetVeiculos.API.Application.Validators;

public class CreateVeiculoValidator : AbstractValidator<CreateVeiculoDto>
{
    public CreateVeiculoValidator()
    {
        RuleFor(x => x.Marca)
            .NotEmpty().WithMessage("Marca é obrigatória")
            .MaximumLength(100).WithMessage("Marca deve ter no máximo 100 caracteres");

        RuleFor(x => x.Modelo)
            .NotEmpty().WithMessage("Modelo é obrigatório")
            .MaximumLength(100).WithMessage("Modelo deve ter no máximo 100 caracteres");

        RuleFor(x => x.Ano)
            .NotEmpty().WithMessage("Ano é obrigatório")
            .GreaterThan(1900).WithMessage("Ano deve ser maior que 1900")
            .LessThanOrEqualTo(DateTime.Now.Year + 1).WithMessage("Ano não pode ser maior que o próximo ano");

        RuleFor(x => x.Placa)
            .NotEmpty().WithMessage("Placa é obrigatória")
            .MaximumLength(10).WithMessage("Placa deve ter no máximo 10 caracteres")
            .Matches(@"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$")
            .WithMessage("Placa deve estar no formato válido (ABC1234 ou ABC1D23)");

        RuleFor(x => x.Km)
            .GreaterThanOrEqualTo(0).WithMessage("Quilometragem deve ser maior ou igual a zero")
            .When(x => x.Km.HasValue);

        RuleFor(x => x.Cor)
            .NotEmpty().WithMessage("Cor é obrigatória")
            .MaximumLength(50).WithMessage("Cor deve ter no máximo 50 caracteres");

        RuleFor(x => x.Preco)
            .NotEmpty().WithMessage("Preço é obrigatório")
            .GreaterThan(0).WithMessage("Preço deve ser maior que zero");

        RuleFor(x => x.OpcionaisIds)
            .Must(x => x == null || x.Count == x.Distinct().Count())
            .WithMessage("Não é possível incluir opcionais duplicados");
    }
}