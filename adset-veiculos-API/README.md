# Adset Veículos API

API desenvolvida em .NET 8 para gerenciamento de veículos com funcionalidades de CRUD, upload de fotos e seleção de pacotes para portais (iCarros e WebMotors).

## 🚀 Tecnologias Utilizadas

- **.NET 8** - Framework principal
- **Entity Framework Core 8.0** - ORM para acesso a dados
- **SQL Server Express** - Banco de dados
- **AutoMapper 12.0** - Mapeamento entre entidades e DTOs
- **FluentValidation 11.8** - Validação de dados
- **Swagger/OpenAPI** - Documentação da API

## 🏗️ Arquitetura

O projeto segue os princípios de **Domain Driven Design (DDD)** e **SOLID**, organizados nas seguintes camadas:

```
├── Domain/
│   ├── Entities/          # Entidades do domínio (POCO)
│   │   ├── Veiculo.cs
│   │   ├── VeiculoFoto.cs
│   │   ├── Opcional.cs
│   │   ├── VeiculoOpcional.cs
│   │   └── VeiculoPacotePortal.cs
│   ├── Enums/            # Enumeradores
│   │   ├── TipoPortal.cs (iCarros, WebMotors)
│   │   └── TipoPacote.cs (Básico, Bronze, Diamante, Platinum)
│   └── Interfaces/       # Contratos dos repositórios
│       ├── IVeiculoRepository.cs
│       └── IOpcionalRepository.cs
├── Application/
│   ├── DTOs/             # Data Transfer Objects
│   │   └── VeiculoDto.cs (VeiculoDto, CreateVeiculoDto, UpdateVeiculoDto, etc.)
│   ├── Mappings/         # Perfis do AutoMapper
│   │   └── VeiculoMappingProfile.cs
│   └── Validators/       # Validadores FluentValidation
│       ├── CreateVeiculoValidator.cs
│       └── UpdateVeiculoValidator.cs
├── Infrastructure/
│   ├── Data/             # DbContext e configurações
│   │   └── VeiculosDbContext.cs
│   └── Repositories/     # Implementação dos repositórios
│       ├── VeiculoRepository.cs
│       └── OpcionalRepository.cs
└── Controllers/          # Controllers da API
    ├── VeiculosController.cs
    ├── OpcionaisController.cs
    └── PacotesPortaisController.cs
```

## 📋 Funcionalidades

### Veículos
- ✅ **CRUD Completo** - Criar, consultar, alterar e excluir veículos
- ✅ **Campos obrigatórios**: Marca, Modelo, Ano, Placa, Cor, Preço
- ✅ **Campos opcionais**: Km, Opcionais
- ✅ **Busca com filtros** por marca, modelo, ano e preço
- ✅ **Upload de até 15 fotos** por veículo
- ✅ **Validação de placa** única no sistema
- ✅ **Controle de transações** com rollback automático

### Opcionais
- ✅ **Opcionais pré-cadastrados**: Ar Condicionado, Alarme, Airbag, Freio ABS
- ✅ **Associação múltipla** de opcionais por veículo
- ✅ **Relacionamento Many-to-Many** com veículos

### Pacotes de Portais
- ✅ **Seleção de pacotes** para iCarros e WebMotors
- ✅ **Tipos de pacotes**: Básico, Bronze, Diamante, Platinum
- ✅ **Um pacote por portal** por veículo (constraint única)
- ✅ **Salvamento individual e múltiplo** de pacotes
- ✅ **Controle de transações** para operações múltiplas

## 🗄️ Banco de Dados

### Entidades e Relacionamentos

1. **Veiculo** - Entidade principal com dados do veículo
   - Campos: Id, Marca, Modelo, Ano, Placa (única), Km, Cor, Preço, DataCadastro, DataAtualizacao
   
2. **VeiculoFoto** - Fotos armazenadas em Base64
   - Campos: Id, VeiculoId, ImagemBase64, NomeArquivo, Ordem, DataUpload
   - Relacionamento: N:1 com Veiculo (Cascade Delete)
   
3. **Opcional** - Opcionais disponíveis
   - Campos: Id, Nome (único)
   - Seed Data: Ar Condicionado, Alarme, Airbag, Freio ABS
   
4. **VeiculoOpcional** - Relacionamento Many-to-Many
   - Chave composta: VeiculoId + OpcionalId
   
5. **VeiculoPacotePortal** - Pacotes selecionados por portal
   - Campos: Id, VeiculoId, TipoPortal, TipoPacote
   - Constraint única: VeiculoId + TipoPortal

### Configurações do Banco
- **Connection String**: SQL Server Express (localhost\\SQLEXPRESS)
- **Migration automática** em desenvolvimento
- **Seed data** para opcionais pré-cadastrados
- **Índices únicos** para placa, nome do opcional e combinação veículo+portal

## 🚀 Como Executar

### Pré-requisitos
- .NET 8 SDK
- SQL Server Express ou SQL Server LocalDB

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
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=AdsetVeiculosDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

4. **Executar a aplicação**
```bash
dotnet run
```

5. **Acessar a documentação**
   - Swagger UI: `https://localhost:7xxx/swagger` ou `http://localhost:5xxx/swagger`
   - Redirecionamento automático da raiz (`/`) para o Swagger
   - A migration será aplicada automaticamente na primeira execução

## 📚 Endpoints da API

### Veículos (`/api/veiculos`)
- `GET /api/veiculos` - Listar todos os veículos
- `GET /api/veiculos/{id}` - Obter veículo por ID
- `GET /api/veiculos/buscar` - Buscar com filtros (marca, modelo, ano, preço)
- `POST /api/veiculos` - Criar novo veículo
- `PUT /api/veiculos/{id}` - Atualizar veículo (com suporte a remoção de fotos)
- `DELETE /api/veiculos/{id}` - Excluir veículo

### Opcionais (`/api/opcionais`)
- `GET /api/opcionais` - Listar todos os opcionais

### Pacotes de Portais (`/api/pacotesportais`)
- `POST /api/pacotesportais/salvar` - Salvar pacote individual
- `POST /api/pacotesportais/salvar-multiplos` - Salvar múltiplos pacotes (com transação)
- `GET /api/pacotesportais/veiculo/{veiculoId}` - Obter pacotes do veículo
- `DELETE /api/pacotesportais/{id}` - Remover pacote

## 🔧 Configurações e Validações

### CORS
- Configurado para aceitar requisições do frontend Angular em `http://localhost:4200`
- Headers e métodos liberados para desenvolvimento

### Validações Implementadas
- **Placa única** no sistema
- **Formatos de placa brasileira** (ABC1234 ou ABC1D23) via regex
- **Ano** entre 1900 e próximo ano
- **Preço** maior que zero
- **Quilometragem** maior ou igual a zero (quando informada)
- **Opcionais únicos** por veículo (sem duplicatas)
- **Campos obrigatórios** com mensagens personalizadas

### Recursos Avançados
- **Transações com rollback** automático em caso de erro
- **Mapeamento automático** entre entidades e DTOs
- **Documentação XML** integrada ao Swagger
- **Cascade delete** para fotos e relacionamentos
- **Controle de ordem** das fotos por veículo

## 📝 Exemplos de Uso

### Criar Veículo com Fotos
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
  "opcionaisIds": [1, 2, 3],
  "fotos": [
    {
      "imagemBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
      "nomeArquivo": "frente.jpg",
      "ordem": 1
    }
  ]
}
```

### Atualizar Veículo Removendo Fotos
```json
PUT /api/veiculos/1
{
  "marca": "Toyota",
  "modelo": "Corolla XEI",
  "ano": 2023,
  "placa": "ABC1234",
  "km": 16000,
  "cor": "Branco",
  "preco": 83000.00,
  "opcionaisIds": [1, 2],
  "fotos": [],
  "fotosParaRemover": [5, 6]
}
```

### Salvar Múltiplos Pacotes
```json
POST /api/pacotesportais/salvar-multiplos
{
  "pacotes": [
    {
      "veiculoId": 1,
      "tipoPortal": 1,
      "tipoPacote": 3
    },
    {
      "veiculoId": 1,
      "tipoPortal": 2,
      "tipoPacote": 2
    }
  ]
}
```

## 🧪 Testes

Para executar os testes (quando implementados):
```bash
dotnet test
```

## 📄 Licença

Este projeto foi desenvolvido para o desafio técnico da Adset.