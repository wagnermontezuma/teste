# API de Testes e Análise UX/UI

API REST para automação de testes e análise de interfaces web, com integração Figma para geração de designs.

## 🚀 Endpoints

### 1. Testar URL
```http
POST /testar-url
```

**Payload:**
```json
{
  "url": "https://exemplo.com"
}
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-04-04T22:59:27.324Z",
  "url": "https://exemplo.com",
  "tempoResposta": "364ms",
  "elementosEncontrados": [
    "Header",
    "Footer",
    "Main content"
  ],
  "elementosNaoEncontrados": [
    "Title",
    "Navigation menu"
  ]
}
```

### 2. Análise UX/UI
```http
POST /analise-ux-ui
```

**Payload:**
```json
{
  "url": "https://exemplo.com"
}
```

**Resposta:**
```json
{
  "status": "ok",
  "notaGeral": 6.0,
  "problemasDetectados": [
    "Missing main title (h1)",
    "Absence of a main navigation menu",
    "Form field without label"
  ],
  "screenshots": {
    "desktop": "/evidencias-uxui/desktop.png",
    "mobile": "/evidencias-uxui/mobile.png"
  },
  "tempoExecucao": "5.4s"
}
```

### 3. Criar Design
```http
POST /criar-design
```

**Payload:**
```json
{
  "prompt": "Descrição do design desejado em linguagem natural"
}
```

**Resposta:**
```json
{
  "status": "ok",
  "descricao": "Design criado com sucesso incluindo: Header, Home page, etc",
  "figma_file_url": "https://www.figma.com/file/..."
}
```

## 🛠️ Tecnologias

- Node.js
- Express
- TypeScript
- Playwright
- Winston (Logs)
- Figma API

## ⚙️ Configuração

1. Clone o repositório
```bash
git clone https://github.com/wagnermontezuma/teste.git
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente (.env)
```env
FIGMA_FILE_KEY=seu_token_aqui
```

4. Execute o servidor
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
├── api/
│   ├── routes/
│   │   ├── testar-url.ts
│   │   ├── analise-ux-ui.ts
│   │   └── criar-design.ts
│   ├── middleware/
│   │   └── validacao.ts
│   └── index.ts
├── services/
│   └── figmaService.ts
├── config/
│   └── logger.ts
├── tests/
│   └── uxui/
│       └── avaliarLayout.ts
└── evidencias-uxui/
    ├── desktop.png
    └── mobile.png
```

## 📝 Logs

Os logs são armazenados em:
- `logs/error.log`: Erros e exceções
- `logs/combined.log`: Todos os logs

## 🔒 Segurança

- Validação de URLs
- Sanitização de inputs
- Tratamento de erros
- Logs estruturados

## 🚧 Roadmap

- [ ] Integração com ferramentas de acessibilidade
- [ ] Geração de relatórios em PDF
- [ ] Dashboard de análises
- [ ] Histórico de testes
- [ ] Integração com CI/CD 