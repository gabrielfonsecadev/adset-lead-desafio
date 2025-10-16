using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AdsetVeiculos.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Opcionais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opcionais", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Veiculos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Marca = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Modelo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ano = table.Column<int>(type: "int", nullable: false),
                    Placa = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Km = table.Column<int>(type: "int", nullable: true),
                    Cor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Preco = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veiculos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VeiculosFotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VeiculoId = table.Column<int>(type: "int", nullable: false),
                    ImagemBase64 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NomeArquivo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    DataUpload = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeiculosFotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VeiculosFotos_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VeiculosOpcionais",
                columns: table => new
                {
                    VeiculoId = table.Column<int>(type: "int", nullable: false),
                    OpcionalId = table.Column<int>(type: "int", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeiculosOpcionais", x => new { x.VeiculoId, x.OpcionalId });
                    table.ForeignKey(
                        name: "FK_VeiculosOpcionais_Opcionais_OpcionalId",
                        column: x => x.OpcionalId,
                        principalTable: "Opcionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VeiculosOpcionais_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VeiculosPacotesPortais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VeiculoId = table.Column<int>(type: "int", nullable: false),
                    TipoPortal = table.Column<int>(type: "int", nullable: false),
                    TipoPacote = table.Column<int>(type: "int", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeiculosPacotesPortais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VeiculosPacotesPortais_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Opcionais",
                columns: new[] { "Id", "Nome" },
                values: new object[,]
                {
                    { 1, "Ar Condicionado" },
                    { 2, "Alarme" },
                    { 3, "Airbag" },
                    { 4, "Freio ABS" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opcionais_Nome",
                table: "Opcionais",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_Placa",
                table: "Veiculos",
                column: "Placa",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VeiculosFotos_VeiculoId_Ordem",
                table: "VeiculosFotos",
                columns: new[] { "VeiculoId", "Ordem" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VeiculosOpcionais_OpcionalId",
                table: "VeiculosOpcionais",
                column: "OpcionalId");

            migrationBuilder.CreateIndex(
                name: "IX_VeiculosPacotesPortais_VeiculoId_TipoPortal",
                table: "VeiculosPacotesPortais",
                columns: new[] { "VeiculoId", "TipoPortal" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VeiculosFotos");

            migrationBuilder.DropTable(
                name: "VeiculosOpcionais");

            migrationBuilder.DropTable(
                name: "VeiculosPacotesPortais");

            migrationBuilder.DropTable(
                name: "Opcionais");

            migrationBuilder.DropTable(
                name: "Veiculos");
        }
    }
}
