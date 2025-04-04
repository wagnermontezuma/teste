# API REST para Testes QA com MCP-Playwright

API RESTful para automatização de testes de QA em tempo real utilizando o servidor MCP-Playwright.

## Funcionalidades

- Teste automatizado de URLs via API REST
- Validação de status HTTP
- Verificação de elementos básicos (title, header, footer, etc.)
- Teste de links principais
- Capturas de tela para erros encontrados
- Validação de entrada de URLs
- Configuração de resolução personalizada

## Estrutura do Projeto

```
/api/
  index.ts               # Ponto de entrada da API
  routes/testar-url.ts   # Rotas do endpoint /testar-url
/tests/
  validarPagina.ts       # Funções de teste com Playwright
/evidencias-erros/        # Diretório para capturas de tela de erros
/logs/                   # Logs da aplicação
```

## Requisitos

- Node.js 14+
- Express.js
- MCP-Playwright configurado no ambiente

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar em modo produção
npm start
```

## Uso da API

### Endpoint: `POST /testar-url`

**Payload:**

```json
{
  "url": "https://www.exemplo.com.br/",
  "resolucao": "1920x1080"  // Opcional
}
```

**Resposta:**

```json
{
  "status": "success",
  "tempo_execucao": "2.3s",
  "url": "https://www.exemplo.com.br/",
  "resolucao": "1920x1080",
  "erros": [],
  "evidencias": []
}
```

**Exemplo de Erro:**

```json
{
  "status": "fail",
  "tempo_execucao": "1.8s",
  "url": "https://www.exemplo.com.br/pagina-nao-existe",
  "resolucao": "1920x1080",
  "erros": ["Página não retornou status 200", "Elemento Título da página (title) não encontrado"],
  "evidencias": ["evidencias-erros/erro-status-20250404-153245.png", "evidencias-erros/elemento-ausente-title-20250404-153246.png"]
}
```

## Exemplos de Uso

### Teste Básico

```bash
curl -X POST http://localhost:3000/testar-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.exemplo.com.br/"}'
```

### Teste com Resolução Personalizada

```bash
curl -X POST http://localhost:3000/testar-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.exemplo.com.br/", "resolucao": "375x812"}'
```

## Validações

- URL deve ser válida e incluir protocolo (http/https)
- Resolução deve seguir o formato widthxheight (ex: 1920x1080)
- Limites de resolução: min 320x240, max 3840x2160

## Logs

Os logs são armazenados em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

## Desenvolvimento

```bash
# Executar testes
npm test

# Iniciar em modo desenvolvimento com recarga automática
npm run dev
```

## Notas

- Esta API utiliza o servidor MCP-Playwright para execução dos testes
- As capturas de tela são armazenadas em `evidencias-erros/` com timestamp
- Em ambientes de produção, configure variáveis de ambiente para porta, etc. 