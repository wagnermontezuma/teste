/**
 * Testes de navegação entre páginas do site Casa Sorveteiro
 */
import { BASE_URL, SELETORES, TIMEOUT } from './config';
import { 
  capturarScreenshotErro, 
  elementoVisivel, 
  expectWithScreenshot,
  obterConteudoHtml
} from './utils';

// Array de páginas para testar
const PAGINAS = [
  { 
    nome: 'Produtos', 
    seletor: 'a[href*="produtos"], a[href*="product"]', 
    identificador: 'produtos' 
  },
  { 
    nome: 'Receitas', 
    seletor: 'a[href*="receitas"], a[href*="recipe"]', 
    identificador: 'receitas' 
  },
  { 
    nome: 'Sobre', 
    seletor: 'a[href*="sobre"], a[href*="about"]', 
    identificador: 'sobre' 
  },
  { 
    nome: 'Contato', 
    seletor: 'a[href*="contato"], a[href*="contact"]', 
    identificador: 'contato' 
  }
];

describe('Navegação entre páginas - Casa Sorveteiro', () => {
  const TEST_NAME = 'navegacao';
  
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
  
  it('deve navegar para as páginas principais pelo menu', async () => {
    try {
      // Para cada página no array de páginas
      for (const pagina of PAGINAS) {
        // Verificar se o link existe
        // @ts-ignore - Função disponível via MCP-Playwright
        const linkExiste = await mcp_playwright_playwright_evaluate({
          script: `
            const links = document.querySelectorAll('${pagina.seletor}');
            return links.length > 0;
          `
        });
        
        // Se o link não existir, registrar e continuar para o próximo
        if (!linkExiste) {
          console.warn(`⚠️ Link para página ${pagina.nome} não encontrado com seletor: ${pagina.seletor}`);
          continue;
        }
        
        // Clicar no link
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_click({
          selector: pagina.seletor
        });
        
        // Esperar navegação
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se a URL contém o identificador da página
        // @ts-ignore - Função disponível via MCP-Playwright
        const url = await mcp_playwright_playwright_evaluate({
          script: `window.location.href`
        });
        
        const urlContainsIdentifier = String(url).toLowerCase().includes(pagina.identificador);
        
        // Testar se navegou corretamente
        expectWithScreenshot(
          urlContainsIdentifier,
          `Falha na navegação para a página ${pagina.nome}. URL: ${url}`,
          `${TEST_NAME}_${pagina.identificador}`
        );
        
        // Capturar screenshot para evidência
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_screenshot({
          name: `sucesso_navegacao_${pagina.identificador}.png`,
          fullPage: false,
          savePng: true
        });
        
        // Voltar para a página inicial para a próxima iteração
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_navigate({
          url: BASE_URL,
          waitUntil: 'networkidle',
          timeout: TIMEOUT
        });
      }
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_navegacao`, erro as Error);
      throw erro;
    }
  });
  
  it('deve mostrar breadcrumbs na página de produtos', async () => {
    try {
      // Encontrar e clicar no link de produtos
      const produtoLink = PAGINAS.find(p => p.nome === 'Produtos');
      if (!produtoLink) {
        throw new Error('Link de produtos não encontrado na configuração de teste');
      }
      
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_click({
        selector: produtoLink.seletor
      });
      
      // Esperar navegação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se existem breadcrumbs
      // @ts-ignore - Função disponível via MCP-Playwright
      const breadcrumbExiste = await mcp_playwright_playwright_evaluate({
        script: `
          const breadcrumb = document.querySelector('${SELETORES.BREADCRUMB}');
          return breadcrumb !== null;
        `
      });
      
      expectWithScreenshot(
        breadcrumbExiste,
        'Breadcrumbs não encontrados na página de produtos',
        `${TEST_NAME}_breadcrumbs`
      );
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_breadcrumbs`, erro as Error);
      throw erro;
    }
  });
}); 