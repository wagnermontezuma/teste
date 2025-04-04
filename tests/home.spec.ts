/**
 * Testes para a página inicial do site Casa Sorveteiro
 */
import { BASE_URL, SELETORES, TIMEOUT } from './config';
import { 
  capturarScreenshotErro, 
  elementoVisivel, 
  expectWithScreenshot,
  obterConteudoHtml,
  obterLogsConsole
} from './utils';

describe('Página inicial - Casa Sorveteiro', () => {
  const TEST_NAME = 'home';
  
  beforeEach(async () => {
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_navigate({
        url: BASE_URL,
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });
    } catch (erro) {
      await capturarScreenshotErro(TEST_NAME, erro as Error);
      throw erro;
    }
  });
  
  it('deve carregar com status 200', async () => {
    try {
      // Verifica se a página carregou com sucesso
      // @ts-ignore - Função disponível via MCP-Playwright
      const logs = await obterLogsConsole();
      const hasErrors = logs.some(log => 
        log.type === 'error' || 
        (log.text && log.text.includes('status=4') || log.text.includes('status=5'))
      );
      
      expectWithScreenshot(!hasErrors, 'A página apresentou erros no console', `${TEST_NAME}_status`);
      
      // Captura screenshot de sucesso
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: `sucesso_home_carregada.png`,
        fullPage: true,
        savePng: true
      });
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_status`, erro as Error);
      throw erro;
    }
  });
  
  it('deve ter o título correto', async () => {
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      const title = await mcp_playwright_playwright_evaluate({
        script: 'document.title'
      });
      
      const expectedTitleContent = ['casa sorveteiro', 'sorveteiro', 'sorveteria'];
      const titleLower = String(title).toLowerCase();
      const titleMatches = expectedTitleContent.some(term => titleLower.includes(term));
      
      expectWithScreenshot(
        titleMatches, 
        `O título da página não contém os termos esperados. Título atual: ${title}`, 
        `${TEST_NAME}_titulo`
      );
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_titulo`, erro as Error);
      throw erro;
    }
  });
  
  it('deve mostrar elementos essenciais', async () => {
    try {
      const elementosParaChecar = [
        { nome: 'Header', selector: SELETORES.HEADER },
        { nome: 'Logo', selector: SELETORES.LOGO },
        { nome: 'Menu Principal', selector: SELETORES.MENU },
        { nome: 'Footer', selector: SELETORES.FOOTER },
        { nome: 'Banner Principal', selector: SELETORES.BANNER_PRINCIPAL },
        { nome: 'Produtos Destaque', selector: SELETORES.PRODUTOS_DESTAQUE }
      ];
      
      for (const elemento of elementosParaChecar) {
        const visivel = await elementoVisivel(elemento.selector);
        expectWithScreenshot(
          visivel, 
          `Elemento '${elemento.nome}' não está visível na página`, 
          `${TEST_NAME}_elemento_${elemento.nome.toLowerCase().replace(/\s+/g, '_')}`
        );
      }
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_elementos`, erro as Error);
      throw erro;
    }
  });
  
  it('deve ter botão de WhatsApp funcional', async () => {
    try {
      // Verifica se o elemento do WhatsApp está visível
      const whatsappVisivel = await elementoVisivel(SELETORES.WHATSAPP_BUTTON);
      expectWithScreenshot(
        whatsappVisivel, 
        'Botão de WhatsApp não está visível na página', 
        `${TEST_NAME}_whatsapp_visibilidade`
      );
      
      // Verifica se o link contém a URL do WhatsApp
      // @ts-ignore - Função disponível via MCP-Playwright
      const whatsappLink = await mcp_playwright_playwright_evaluate({
        script: `
          const elemento = document.querySelector('${SELETORES.WHATSAPP_BUTTON}');
          return elemento ? elemento.href || '' : '';
        `
      });
      
      const hasWhatsappLink = String(whatsappLink).includes('whatsapp');
      expectWithScreenshot(
        hasWhatsappLink, 
        `Link de WhatsApp não é válido: ${whatsappLink}`, 
        `${TEST_NAME}_whatsapp_link`
      );
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_whatsapp`, erro as Error);
      throw erro;
    }
  });
}); 