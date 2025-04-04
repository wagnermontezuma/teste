/**
 * Testes de responsividade do site Casa Sorveteiro
 */
import { BASE_URL, SELETORES, TIMEOUT, DISPOSITIVOS } from './config';
import { 
  capturarScreenshotErro, 
  elementoVisivel, 
  expectWithScreenshot
} from './utils';

// Elementos a verificar em diferentes dispositivos
const ELEMENTOS_PARA_VERIFICAR = [
  { nome: 'Header', selector: SELETORES.HEADER },
  { nome: 'Menu', selector: SELETORES.MENU },
  { nome: 'Logo', selector: SELETORES.LOGO },
  { nome: 'Footer', selector: SELETORES.FOOTER },
  { nome: 'WhatsApp', selector: SELETORES.WHATSAPP_BUTTON }
];

describe('Responsividade - Casa Sorveteiro', () => {
  // Para cada dispositivo, realizar as verificações
  Object.entries(DISPOSITIVOS).forEach(([dispositivo, config]) => {
    describe(`Dispositivo: ${config.nome} (${config.width}x${config.height})`, () => {
      const TEST_NAME = `responsividade_${config.nome.toLowerCase()}`;
      
      beforeEach(async () => {
        try {
          // Configurar o User Agent para simular o dispositivo
          // @ts-ignore - Função disponível via MCP-Playwright
          await mcp_playwright_playwright_custom_user_agent({
            userAgent: config.userAgent
          });
          
          // Navegar para a página inicial com as dimensões do dispositivo
          // @ts-ignore - Função disponível via MCP-Playwright
          await mcp_playwright_playwright_navigate({
            url: BASE_URL,
            waitUntil: 'networkidle',
            timeout: TIMEOUT,
            width: config.width,
            height: config.height
          });
        } catch (erro) {
          await capturarScreenshotErro(TEST_NAME, erro as Error);
          throw erro;
        }
      });
      
      it('deve carregar com layout responsivo', async () => {
        try {
          // Capturar screenshot para documentação
          // @ts-ignore - Função disponível via MCP-Playwright
          await mcp_playwright_playwright_screenshot({
            name: `layout_${config.nome.toLowerCase()}.png`,
            fullPage: true,
            savePng: true
          });
          
          // Verificar se elementos-chave estão presentes
          for (const elemento of ELEMENTOS_PARA_VERIFICAR) {
            // @ts-ignore - Função disponível via MCP-Playwright
            const elementoPresente = await mcp_playwright_playwright_evaluate({
              script: `
                const el = document.querySelector('${elemento.selector}');
                return el !== null;
              `
            });
            
            expectWithScreenshot(
              elementoPresente,
              `Elemento '${elemento.nome}' não está presente em ${config.nome}`,
              `${TEST_NAME}_${elemento.nome.toLowerCase()}`
            );
          }
        } catch (erro) {
          await capturarScreenshotErro(`${TEST_NAME}_layout`, erro as Error);
          throw erro;
        }
      });
      
      // Teste específico para dispositivos móveis
      if (config.width < 768) {
        it('deve mostrar menu hamburguer em dispositivos móveis', async () => {
          try {
            // Verificar presença do menu hamburguer
            // @ts-ignore - Função disponível via MCP-Playwright
            const menuHamburguerPresente = await mcp_playwright_playwright_evaluate({
              script: `
                const menuBtn = document.querySelector('${SELETORES.MENU_HAMBURGER}');
                return menuBtn !== null && 
                       window.getComputedStyle(menuBtn).display !== 'none';
              `
            });
            
            expectWithScreenshot(
              menuHamburguerPresente,
              `Menu hamburger não encontrado em ${config.nome}`,
              `${TEST_NAME}_menu_hamburguer`
            );
            
            // Teste adicional: tentar clicar no menu e verificar se expande
            if (menuHamburguerPresente) {
              try {
                // @ts-ignore - Função disponível via MCP-Playwright
                await mcp_playwright_playwright_click({
                  selector: SELETORES.MENU_HAMBURGER
                });
                
                // Esperar a animação do menu
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Capturar screenshot com menu aberto
                // @ts-ignore - Função disponível via MCP-Playwright
                await mcp_playwright_playwright_screenshot({
                  name: `menu_aberto_${config.nome.toLowerCase()}.png`,
                  fullPage: false,
                  savePng: true
                });
              } catch (erroClick) {
                console.warn(`⚠️ Não foi possível clicar no menu hamburguer: ${erroClick}`);
              }
            }
          } catch (erro) {
            await capturarScreenshotErro(`${TEST_NAME}_menu_hamburguer`, erro as Error);
            throw erro;
          }
        });
      }
      
      it('deve ter elementos proporcionais ao tamanho do dispositivo', async () => {
        try {
          // Verificar se os elementos principais têm dimensões adequadas
          // @ts-ignore - Função disponível via MCP-Playwright
          const dimensoesElementos = await mcp_playwright_playwright_evaluate({
            script: `
              const resultado = {};
              
              // Verificar largura do container principal
              const container = document.querySelector('main, #main, .container, .main-content');
              if (container) {
                const containerStyle = window.getComputedStyle(container);
                resultado.containerWidth = container.offsetWidth;
                resultado.containerOverflow = containerStyle.overflowX;
                
                // Verificar se não há overflow horizontal
                resultado.semOverflowX = 
                  window.innerWidth >= document.documentElement.scrollWidth;
              }
              
              // Verificar imagens
              const imagens = document.querySelectorAll('img');
              resultado.todasImagensResponsivas = true;
              
              for (const img of imagens) {
                const rect = img.getBoundingClientRect();
                // Se imagem é maior que a largura da janela, não é responsiva
                if (rect.width > window.innerWidth) {
                  resultado.todasImagensResponsivas = false;
                  break;
                }
              }
              
              return resultado;
            `
          });
          
          // Verificar se não há overflow horizontal
          expectWithScreenshot(
            dimensoesElementos.semOverflowX === true,
            `Overflow horizontal detectado em ${config.nome}`,
            `${TEST_NAME}_overflow`
          );
          
          // Verificar se as imagens estão contidas na largura da tela
          expectWithScreenshot(
            dimensoesElementos.todasImagensResponsivas === true,
            `Imagens não responsivas detectadas em ${config.nome}`,
            `${TEST_NAME}_imagens`
          );
        } catch (erro) {
          await capturarScreenshotErro(`${TEST_NAME}_dimensoes`, erro as Error);
          throw erro;
        }
      });
    });
  });
}); 