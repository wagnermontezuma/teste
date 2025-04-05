import { Request, Response, NextFunction } from 'express';

export function validarUrl(req: Request, res: Response, next: NextFunction) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'URL não fornecida'
    });
  }

  try {
    new URL(url);
    next();
  } catch (error) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'URL inválida'
    });
  }
} 