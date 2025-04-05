import { Router, Request, Response } from 'express';
import { chromium } from 'playwright';
import { avaliarLayout } from '../../tests/uxui/avaliarLayout';
import { validarUrl } from '../middleware/validacao';

const router = Router();

router.post('/analise-ux-ui', validarUrl, async (req: Request, res: Response) => {
  const { url } = req.body;
  
  try {
    // Iniciar o navegador em modo headless
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Realizar análise
    const resultado = await avaliarLayout(page, url);

    // Fechar navegador
    await browser.close();

    // Retornar resultado
    res.json({
      status: 'ok',
      ...resultado
    });

  } catch (error) {
    console.error('Erro ao analisar UX/UI:', error);
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao realizar análise de UX/UI',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router; 