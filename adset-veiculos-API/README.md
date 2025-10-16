# Adset Veículos API

API desenvolvida em .NET 8 para gerenciamento de veículos com funcionalidades de CRUD, upload de fotos e seleção de pacotes para portais (iCarros e WebMotors).

## 🚀 Tecnologias Utilizadas

- **.NET 8** - Framework principal
- **Entity Framework Core** - ORM para acesso a dados
- **SQL Server** - Banco de dados
- **AutoMapper** - Mapeamento entre entidades e DTOs
- **FluentValidation** - Validação de dados
- **Swagger** - Documentação da API

## 🏗️ Arquitetura

O projeto segue os princípios de **Domain Driven Design (DDD)** e **SOLID**, organizados nas seguintes camadas:

```
├── Domain/
│   ├── Entities/          # Entidades do domínio (POCO)
│   ├── Enums/            # Enumeradores
│   └── Interfaces/       # Contratos dos repositórios
├── Application/
│   ├── DTOs/             # Data Transfer Objects
│   ├── Mappings/         # Perfis do AutoMapper
│   └── Validators/       # Validadores FluentValidation
├── Infrastructure/
│   ├── Data/             # DbContext
│   └── Repositories/     # Implementação dos repositórios
└── Controllers/          # Controllers da API
```

## 📋 Funcionalidades

### Veículos
- ✅ **CRUD Completo** - Criar, consultar, alterar e excluir veículos
- ✅ **Campos obrigatórios**: Marca, Modelo, Ano, Placa, Cor, Preço
- ✅ **Campos opcionais**: Km, Opcionais
- ✅ **Busca com filtros** por marca, modelo, ano e preço
- ✅ **Upload de até 15 fotos** por veículo
- ✅ **Validação de placa** única no sistema

### Opcionais
- ✅ **Opcionais pré-cadastrados**: Ar Condicionado, Alarme, Airbag, Freio ABS
- ✅ **Associação múltipla** de opcionais por veículo

### Pacotes de Portais
- ✅ **Seleção de pacotes** para iCarros e WebMotors
- ✅ **Tipos de pacotes**: Básico, Bronze, Diamante, Platinum
- ✅ **Um pacote por portal** por veículo
- ✅ **Endpoint para salvar** pacotes selecionados

## 🗄️ Banco de Dados

### Entidades Principais

1. **Veiculo** - Dados principais do veículo
2. **VeiculoFoto** - Fotos do veículo (até 15)
3. **Opcional** - Opcionais disponíveis
4. **VeiculoOpcional** - Relacionamento Many-to-Many
5. **VeiculoPacotePortal** - Pacotes selecionados por portal

### Migration

A migration está configurada para ser executada automaticamente em desenvolvimento. O banco será criado com dados iniciais dos opcionais.

## 🚀 Como Executar

### Pré-requisitos
- .NET 8 SDK
- SQL Server ou SQL Server LocalDB

### Passos

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd adset-veiculos-API
```

2. **Restaurar dependências**
```bash
dotnet restore
```

3. **Configurar Connection String**
   - Edite o arquivo `appsettings.json`
   - Ajuste a connection string conforme seu ambiente:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=AdsetVeiculosDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

4. **Executar a aplicação**
```bash
dotnet run
```

5. **Acessar a documentação**
   - Swagger UI: `https://localhost:7xxx/swagger`
   - A migration será aplicada automaticamente na primeira execução

## 📚 Endpoints da API

### Veículos
- `GET /api/veiculos` - Listar todos os veículos
- `GET /api/veiculos/{id}` - Obter veículo por ID
- `GET /api/veiculos/buscar` - Buscar com filtros
- `POST /api/veiculos` - Criar novo veículo
- `PUT /api/veiculos/{id}` - Atualizar veículo
- `DELETE /api/veiculos/{id}` - Excluir veículo

### Opcionais
- `GET /api/opcionais` - Listar todos os opcionais
- `GET /api/opcionais/ativos` - Listar opcionais ativos
- `GET /api/opcionais/{id}` - Obter opcional por ID

### Pacotes de Portais
- `POST /api/pacotesportais/salvar` - Salvar pacote individual
- `POST /api/pacotesportais/salvar-multiplos` - Salvar múltiplos pacotes
- `GET /api/pacotesportais/veiculo/{veiculoId}` - Obter pacotes do veículo
- `DELETE /api/pacotesportais/{id}` - Remover pacote

## 🔧 Configurações Adicionais

### CORS
Configurado para aceitar requisições do frontend Angular em `http://localhost:4200`

### Validações
- Placa única no sistema
- Formatos de placa brasileira (ABC1234 ou ABC1D23)
- Ano entre 1900 e próximo ano
- Preço maior que zero
- Máximo 15 fotos por veículo

## 📝 Exemplos de Uso

### Criar Veículo
```json
POST /api/veiculos
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "ano": 2023,
  "placa": "ABC1234",
  "km": 15000,
  "cor": "Branco",
  "preco": 85000.00,
  "opcionaisIds": [1, 2, 3]
}
```

### Salvar Pacote Portal
```json
POST /api/pacotesportais/salvar
{
  "veiculoId": 1,
  "tipoPortal": 1,
  "tipoPacote": 3
}
```

## 🧪 Testes

Para executar os testes (quando implementados):
```bash
dotnet test
```

## 📄 Licença

Este projeto foi desenvolvido para o desafio técnico da Adset.