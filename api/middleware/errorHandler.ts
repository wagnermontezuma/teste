import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para tratamento de erros
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`Erro: ${err.message}`);
  console.error(err.stack);
  
  // Resposta padrão para erros
  res.status(500).json({
    status: 'error',
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
}

/**
 * Middleware para tratamento de rotas não encontradas
 */
export function notFoundHandler(
  req: Request,
  res: Response
) {
  res.status(404).json({
    status: 'error',
    mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Middleware para log de requisições
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  
  // Log quando a resposta for enviada
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
} 