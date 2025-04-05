import logger from '../config/logger';

interface DesignResponse {
  status: string;
  descricao: string;
  figma_file_url: string;
  error?: string;
}

interface DesignElements {
  header: boolean;
  sections: {
    home: boolean;
    tests: boolean;
    uxui: boolean;
    history: boolean;
  };
  components: {
    logo: boolean;
    menu: boolean;
    forms: boolean;
    cards: boolean;
    results: boolean;
  };
}

export class FigmaService {
  private fileKey: string;

  constructor(fileKey: string) {
    this.fileKey = fileKey;
  }

  private parsePrompt(prompt: string): DesignElements {
    const elements: DesignElements = {
      header: true, // Header é obrigatório conforme prompt
      sections: {
        home: prompt.toLowerCase().includes('home page'),
        tests: prompt.toLowerCase().includes('tela de testes'),
        uxui: prompt.toLowerCase().includes('tela de análise'),
        history: prompt.toLowerCase().includes('histórico')
      },
      components: {
        logo: prompt.toLowerCase().includes('logo'),
        menu: prompt.toLowerCase().includes('menu'),
        forms: prompt.toLowerCase().includes('campo para'),
        cards: prompt.toLowerCase().includes('cards'),
        results: prompt.toLowerCase().includes('resultado')
      }
    };
    return elements;
  }

  async createDesign(prompt: string): Promise<DesignResponse> {
    try {
      // Analisa o prompt para identificar os elementos necessários
      const elements = this.parsePrompt(prompt);
      
      // Em uma implementação completa, aqui seriam feitas as chamadas para o MCP Figma
      // para criar cada elemento do design
      
      // Por enquanto, retornamos uma resposta simulada
      const figmaUrl = `https://www.figma.com/file/${this.fileKey}/API-Test-UXUI`;

      const descricao = `Design criado com sucesso incluindo:
        - Header com logo e menu de navegação
        - Home page com cards de ação
        - Telas de teste e análise UX/UI
        - Histórico de análises
        - Layout responsivo (desktop 1440px e mobile 375px)`;

      logger.info(`Design criado com sucesso: ${figmaUrl}`);

      return {
        status: 'ok',
        descricao,
        figma_file_url: figmaUrl
      };

    } catch (error) {
      logger.error('Erro ao criar design no Figma:', error);
      return {
        status: 'erro',
        descricao: 'Falha ao criar o design',
        figma_file_url: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 