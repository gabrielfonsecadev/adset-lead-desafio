using Microsoft.EntityFrameworkCore;
using FluentValidation;
using AdsetVeiculos.API.Infrastructure.Data;
using AdsetVeiculos.API.Domain.Interfaces;
using AdsetVeiculos.API.Infrastructure.Repositories;
using AdsetVeiculos.API.Application.Mappings;
using AdsetVeiculos.API.Application.Validators;
using AdsetVeiculos.API.Application.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Entity Framework
builder.Services.AddDbContext<VeiculosDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// AutoMapper
builder.Services.AddAutoMapper(typeof(VeiculoMappingProfile));

// FluentValidation
builder.Services.AddScoped<IValidator<CreateVeiculoDto>, CreateVeiculoValidator>();
builder.Services.AddScoped<IValidator<UpdateVeiculoDto>, UpdateVeiculoValidator>();

// Repositories
builder.Services.AddScoped<IVeiculoRepository, VeiculoRepository>();
builder.Services.AddScoped<IOpcionalRepository, OpcionalRepository>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Adset Veículos API", Version = "v1" });
    
    // Incluir comentários XML
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");

app.UseAuthorization();

app.MapControllers();

// Redirecionar a raiz para o Swagger
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));

// Aplicar migrations automaticamente em desenvolvimento
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<VeiculosDbContext>();
    context.Database.Migrate();
}

app.Run();
