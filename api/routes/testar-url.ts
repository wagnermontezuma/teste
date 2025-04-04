import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { executarTestesPagina } from '../../tests/validarPagina';
// Importar o teste adaptado
const { testarUrl } = require('../../tests/adapt-test');

const router = express.Router();

// Middleware de validação para URLs
const validarUrl = [
  body('url')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })
    .withMessage('URL inválida. Forneça uma URL completa com http ou https')
    .trim(),
  
  // Middleware para verificar os resultados da validação
  (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    next();
  }
];

// Middleware para validação opcional de resolução
const validarResolucao = [
  body('resolucao')
    .optional()
    .custom((value) => {
      // Verifica se está no formato correto: widthxheight (ex: 1920x1080)
      const pattern = /^\d+x\d+$/;
      if (!pattern.test(value)) {
        throw new Error('Formato de resolução inválido. Use o formato widthxheight (ex: 1920x1080)');
      }
      
      // Extrai e verifica os valores
      const [width, height] = value.split('x').map(Number);
      if (width < 320 || width > 3840 || height < 240 || height > 2160) {
        throw new Error('Resolução fora dos limites suportados (min: 320x240, max: 3840x2160)');
      }
      
      return true;
    })
];

/**
 * @route   POST /testar-url
 * @desc    Executa testes automatizados em uma URL
 * @access  Public
 */
router.post('/', [...validarUrl, ...validarResolucao], async (req: Request, res: Response) => {
  const inicio = Date.now();
  const { url } = req.body;
  const resolucao = req.body.resolucao || '1920x1080';
  
  try {
    // Extrair as dimensões da resolução
    const [width, height] = resolucao.split('x').map(Number);
    
    // Executar testes
    console.log(`🔍 Iniciando testes para: ${url} (Resolução: ${resolucao})`);
    
    const resultado = await executarTestesPagina(url, width, height);
    
    // Calcular tempo de execução
    const fim = Date.now();
    const tempoExecucao = ((fim - inicio) / 1000).toFixed(1);
    
    // Retornar resultados
    res.json({
      status: resultado.sucesso ? 'success' : 'fail',
      tempo_execucao: `${tempoExecucao}s`,
      url: url,
      resolucao: resolucao,
      erros: resultado.erros,
      evidencias: resultado.evidencias
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar testes:', error);
    
    // Calcular tempo de execução mesmo em caso de erro
    const fim = Date.now();
    const tempoExecucao = ((fim - inicio) / 1000).toFixed(1);
    
    res.status(500).json({
      status: 'error',
      tempo_execucao: `${tempoExecucao}s`,
      url: url,
      mensagem: 'Erro ao executar testes',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * @route   POST /testar-url/alternativo
 * @desc    Executa testes simplificados em uma URL (sem depender do MCP-Playwright)
 * @access  Public
 */
router.post('/alternativo', [...validarUrl], async (req: Request, res: Response) => {
  const inicio = Date.now();
  const { url } = req.body;
  
  try {
    console.log(`🔍 Iniciando testes alternativos para: ${url}`);
    
    // Usar o teste adaptado
    const resultado = await testarUrl(url);
    
    // Calcular tempo de execução
    const fim = Date.now();
    const tempoExecucao = ((fim - inicio) / 1000).toFixed(1);
    
    // Retornar resultados
    res.json({
      status: resultado.sucesso ? 'success' : 'fail',
      tempo_execucao: `${tempoExecucao}s`,
      url: url,
      statusCode: resultado.statusCode,
      elementos: resultado.elementos,
      links: resultado.links,
      erros: resultado.erros,
      relatorio: resultado.relatorio
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar testes alternativos:', error);
    
    // Calcular tempo de execução mesmo em caso de erro
    const fim = Date.now();
    const tempoExecucao = ((fim - inicio) / 1000).toFixed(1);
    
    res.status(500).json({
      status: 'error',
      tempo_execucao: `${tempoExecucao}s`,
      url: url,
      mensagem: 'Erro ao executar testes alternativos',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router; 