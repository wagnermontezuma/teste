import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

// Importando rotas
import testarUrlRouter from './routes/testar-url';
import analiseUxUiRouter from './routes/analise-ux-ui';

// Importando middleware
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';

// Configuração do logger
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'api-testes-qa' },
  transports: [
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    new transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Inicialização da aplicação
const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // Habilita CORS
app.use(express.json()); // Parse do body em JSON
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Log de requisições

// Logging de requisições
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rotas
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API de testes QA - MCP Playwright',
    versao: '1.0.0'
  });
});

app.use('/testar-url', testarUrlRouter);
app.use('/', analiseUxUiRouter);

// 404 para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erro
app.use(errorHandler);

// Iniciando o servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`Servidor iniciado na porta ${PORT}`);
  });
}

export default app; 