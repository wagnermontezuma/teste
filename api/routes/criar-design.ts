import { Router, Request, Response } from 'express';
import { FigmaService } from '../../services/figmaService';
import logger from '../../config/logger';

const router = Router();
const figmaService = new FigmaService(process.env.FIGMA_FILE_KEY || '');

interface CreateDesignRequest {
  prompt: string;
}

router.post('/criar-design', async (req: Request<{}, {}, CreateDesignRequest>, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'erro',
        mensagem: 'O prompt é obrigatório'
      });
    }

    if (!process.env.FIGMA_FILE_KEY) {
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Configuração do Figma não encontrada'
      });
    }

    const result = await figmaService.createDesign(prompt);

    if (result.status === 'erro') {
      return res.status(500).json(result);
    }

    logger.info(`Design criado com sucesso: ${result.figma_file_url}`);
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Erro ao processar requisição de criação de design:', error);
    return res.status(500).json({
      status: 'erro',
      mensagem: 'Erro interno ao processar a requisição',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router; 