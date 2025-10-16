using Microsoft.EntityFrameworkCore;
using AdsetVeiculos.API.Domain.Entities;
using AdsetVeiculos.API.Domain.Enums;

namespace AdsetVeiculos.API.Infrastructure.Data;

public class VeiculosDbContext : DbContext
{
    public VeiculosDbContext(DbContextOptions<VeiculosDbContext> options) : base(options)
    {
    }

    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<VeiculoFoto> VeiculosFotos { get; set; }
    public DbSet<Opcional> Opcionais { get; set; }
    public DbSet<VeiculoOpcional> VeiculosOpcionais { get; set; }
    public DbSet<VeiculoPacotePortal> VeiculosPacotesPortais { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração da entidade Veiculo
        modelBuilder.Entity<Veiculo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Marca).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Modelo).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Ano).IsRequired();
            entity.Property(e => e.Placa).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Cor).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Preco).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.DataCadastro).IsRequired();

            entity.HasIndex(e => e.Placa).IsUnique();
        });

        // Configuração da entidade VeiculoFoto
        modelBuilder.Entity<VeiculoFoto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImagemBase64).IsRequired().HasColumnType("nvarchar(max)");
            entity.Property(e => e.NomeArquivo).HasMaxLength(255);
            entity.Property(e => e.Ordem).IsRequired();
            entity.Property(e => e.DataUpload).IsRequired();

            entity.HasOne(e => e.Veiculo)
                  .WithMany(v => v.Fotos)
                  .HasForeignKey(e => e.VeiculoId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.VeiculoId, e.Ordem }).IsUnique();
        });

        // Configuração da entidade Opcional
        modelBuilder.Entity<Opcional>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);

            entity.HasIndex(e => e.Nome).IsUnique();
        });

        // Configuração da entidade VeiculoOpcional (Many-to-Many)
        modelBuilder.Entity<VeiculoOpcional>(entity =>
        {
            entity.HasKey(e => new { e.VeiculoId, e.OpcionalId });

            entity.HasOne(e => e.Veiculo)
                  .WithMany(v => v.Opcionais)
                  .HasForeignKey(e => e.VeiculoId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Opcional)
                  .WithMany(o => o.VeiculosOpcionais)
                  .HasForeignKey(e => e.OpcionalId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuração da entidade VeiculoPacotePortal
        modelBuilder.Entity<VeiculoPacotePortal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TipoPortal).IsRequired().HasConversion<int>();
            entity.Property(e => e.TipoPacote).IsRequired().HasConversion<int>();

            entity.HasOne(e => e.Veiculo)
                  .WithMany(v => v.PacotesPortais)
                  .HasForeignKey(e => e.VeiculoId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Garantir que cada veículo tenha apenas um pacote por portal
            entity.HasIndex(e => new { e.VeiculoId, e.TipoPortal }).IsUnique();
        });

        // Seed data para Opcionais
        modelBuilder.Entity<Opcional>().HasData(
            new Opcional { Id = 1, Nome = "Ar Condicionado" },
            new Opcional { Id = 2, Nome = "Alarme" },
            new Opcional { Id = 3, Nome = "Airbag" },
            new Opcional { Id = 4, Nome = "Freio ABS" }
        );
    }
}