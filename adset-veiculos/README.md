# Adset Veículos - Frontend Angular

Sistema de gerenciamento de veículos desenvolvido em **Angular 12** com **Node.js 16**, integrado com API .NET 8 para cadastro, edição, listagem e gerenciamento de pacotes para portais automotivos.

## 🚀 Tecnologias Utilizadas

- **Angular**: 12.2.0
- **Node.js**: 16.20.2 (especificado em `.nvmrc`)
- **Angular CLI**: 12.2.18
- **TypeScript**: 4.3.5
- **Angular Material**: 12.2.13
- **TailwindCSS**: 3.4.18
- **RxJS**: 6.6.0

## 📋 Pré-requisitos

- **Node.js 16.20.2** (obrigatório - use NVM para gerenciar versões)
- **Angular CLI 12.2.18**
- **API Backend** rodando em `http://localhost:5000`

## 🛠️ Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar o projeto
**Opção 1 - Comando personalizado (recomendado):**
```bash
npm start
```

**Opção 2 - Comando completo:**
```bash
nvm use 16 && npx @angular/cli@12 serve --port 4200
```

### 3. Acessar a aplicação
Navegue para `http://localhost:4200/` no seu navegador.

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas
```
src/app/
├── components/           # Componentes da aplicação
│   ├── header/          # Cabeçalho da aplicação
│   ├── veiculo-form/    # Formulário de cadastro/edição
│   ├── veiculo-lista/   # Lista de veículos com filtros
│   └── confirm-dialog/  # Modal de confirmação
├── services/            # Serviços para comunicação com API
│   ├── veiculo.service.ts
│   ├── opcional.service.ts
│   ├── pacote-portal.service.ts
│   └── outros serviços...
├── models/              # Interfaces e modelos TypeScript
│   └── veiculo.model.ts
├── interfaces/          # Interfaces específicas
└── environments/        # Configurações de ambiente
```

### Componentes Principais

#### 🚗 **VeiculoFormComponent**
- Formulário reativo para cadastro/edição de veículos
- Upload de múltiplas fotos em Base64
- Seleção de opcionais via checkboxes
- Validação de campos obrigatórios

#### 📋 **VeiculoListaComponent**
- Listagem paginada de veículos
- Sistema de filtros avançados (marca, modelo, ano, preço, etc.)
- Ordenação por diferentes campos
- Ações de editar/excluir

#### 🎯 **HeaderComponent**
- Navegação principal da aplicação
- Estatísticas de veículos cadastrados

## 🔧 Funcionalidades

### ✅ **Gerenciamento de Veículos**
- **Cadastro** com validação de campos obrigatórios
- **Edição** com preservação de dados existentes
- **Exclusão** com confirmação
- **Listagem** com paginação e filtros

### 📸 **Upload de Fotos**
- Upload múltiplo de imagens em **Base64**
- Ordenação de fotos por drag-and-drop
- Remoção individual de fotos
- Preview das imagens

### 🔍 **Sistema de Filtros**
- Filtro por placa, marca, modelo
- Filtro por faixa de ano e preço
- Filtro por presença de fotos
- Filtro por cor e opcionais

### 📦 **Pacotes para Portais**
- Configuração de pacotes para **iCarros** e **WebMotors**
- Tipos de pacotes: Básico, Bronze, Diamante, Platinum
- Salvamento em lote com controle de transações

## 🌐 Integração com API

### Configuração
- **URL Base**: `http://localhost:5000` (configurado em `environment.ts`)
- **Endpoints**: `/api/Veiculos`, `/api/Opcionais`, `/api/PacotesPortais`

### Serviços Implementados

#### **VeiculoService**
```typescript
// Principais métodos
getVeiculos(): Observable<Veiculo[]>
addVeiculo(dto: InsertUpdVeiculoDto): Observable<Veiculo>
updateVeiculo(id: number, dto: InsertUpdVeiculoDto): Observable<Veiculo>
deleteVeiculo(id: number): Observable<boolean>
buscarVeiculos(filtro: FiltroVeiculo): Observable<Veiculo[]>
```

#### **OpcionalService**
```typescript
getOpcionais(): Observable<OpcionalDto[]>
```

#### **PacotePortalService**
```typescript
salvarPacotePortal(dto: SalvarPacotePortalDto): Observable<any>
```

## 🎨 Estilização

### Angular Material
- **Componentes**: Buttons, Cards, Forms, Dialogs, Snackbars
- **Tema**: Material Design padrão
- **Ícones**: Material Icons

### TailwindCSS
- **Utility-first** CSS framework
- **Responsividade** mobile-first
- **Configuração**: `tailwind.config.js` com `important: true`

## 📝 Scripts Disponíveis

```json
{
  "start": "nvm use 16 && npx @angular/cli@12 serve --port 4200",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

## 🔧 Configurações Importantes

### TypeScript (tsconfig.json)
- **Target**: ES2017
- **Strict mode**: Habilitado
- **Experimental Decorators**: Habilitado

### Angular (angular.json)
- **Output Path**: `dist/adset-veiculos-ng12`
- **Style Preprocessor**: SCSS
- **Assets**: Favicon e pasta assets

## 🚨 Requisitos de Versão

⚠️ **IMPORTANTE**: Este projeto requer especificamente:
- **Node.js 16.20.2** (definido em `.nvmrc`)
- **Angular CLI 12.2.18**

Para garantir compatibilidade, sempre use:
```bash
nvm use 16
```

## 🔗 Dependências com a API

O frontend depende da **API .NET 8** rodando em `http://localhost:5000`. Certifique-se de que a API esteja executando antes de iniciar o frontend.

## 📱 Responsividade

A aplicação é totalmente responsiva, utilizando:
- **Angular Flex Layout**
- **TailwindCSS** utilities
- **Angular Material** responsive breakpoints

---

**Desenvolvido com Angular 12 + Node.js 16 para máxima compatibilidade e performance.**
