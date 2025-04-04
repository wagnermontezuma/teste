/**
 * Testes do formulário de contato do site Casa Sorveteiro
 */
import { BASE_URL, SELETORES, TIMEOUT } from './config';
import { 
  capturarScreenshotErro, 
  elementoVisivel, 
  expectWithScreenshot,
  esperarElementoVisivel
} from './utils';

// URLs possíveis para a página de contato
const URL_CONTATO = `${BASE_URL}/contato`;
const URL_CONTATO_ALT = `${BASE_URL}/fale-conosco`;

// Dados de teste para o formulário de contato
const DADOS_VALIDOS = {
  nome: 'Teste Automatizado',
  email: 'teste@example.com',
  telefone: '11999999999',
  assunto: 'Teste automatizado - Não considerar',
  mensagem: 'Esta é uma mensagem de teste automatizado. Por favor, desconsiderar.'
};

const DADOS_INVALIDOS = {
  nome: '',
  email: 'email-invalido',
  telefone: 'abc',
  assunto: '',
  mensagem: ''
};

describe('Formulário de Contato - Casa Sorveteiro', () => {
  const TEST_NAME = 'contato';
  
  beforeEach(async () => {
    try {
      // Tentar navegar diretamente para a página de contato
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_navigate({
        url: URL_CONTATO,
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });
      
      // Verificar se estamos na página de contato
      // @ts-ignore - Função disponível via MCP-Playwright
      const urlAtual = await mcp_playwright_playwright_evaluate({
        script: 'window.location.href'
      });
      
      // Se não estamos na página de contato, tentar URL alternativa
      if (!String(urlAtual).toLowerCase().includes('contato')) {
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_navigate({
          url: URL_CONTATO_ALT,
          waitUntil: 'networkidle',
          timeout: TIMEOUT
        });
        
        // Verificar novamente
        // @ts-ignore - Função disponível via MCP-Playwright
        const urlAlternativa = await mcp_playwright_playwright_evaluate({
          script: 'window.location.href'
        });
        
        // Se ainda não estamos na página de contato, tentar encontrar o link no menu
        if (!String(urlAlternativa).toLowerCase().includes('contato') && 
            !String(urlAlternativa).toLowerCase().includes('fale-conosco')) {
          
          // Ir para a home e procurar um link de contato
          // @ts-ignore - Função disponível via MCP-Playwright
          await mcp_playwright_playwright_navigate({
            url: BASE_URL,
            waitUntil: 'networkidle',
            timeout: TIMEOUT
          });
          
          // Procurar e clicar no link de contato
          // @ts-ignore - Função disponível via MCP-Playwright
          const temLinkContato = await mcp_playwright_playwright_evaluate({
            script: `
              const links = Array.from(document.querySelectorAll('a'));
              const linkContato = links.find(
                link => link.textContent.toLowerCase().includes('contato') || 
                       link.textContent.toLowerCase().includes('fale') ||
                       link.href.toLowerCase().includes('contato') ||
                       link.href.toLowerCase().includes('fale-conosco')
              );
              
              if (linkContato) {
                linkContato.click();
                return true;
              }
              return false;
            `
          });
          
          if (!temLinkContato) {
            throw new Error('Não foi possível encontrar a página de contato');
          }
          
          // Esperar a navegação
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } catch (erro) {
      await capturarScreenshotErro(TEST_NAME, erro as Error);
      throw erro;
    }
  });
  
  it('deve ter formulário de contato na página', async () => {
    try {
      // Verificar se o formulário de contato está presente
      const formVisivel = await elementoVisivel(SELETORES.FORMULARIO_CONTATO);
      
      expectWithScreenshot(
        formVisivel,
        'Formulário de contato não está visível na página',
        `${TEST_NAME}_formulario_visivel`
      );
      
      // Capturar screenshot do formulário
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: `formulario_contato.png`,
        selector: SELETORES.FORMULARIO_CONTATO,
        savePng: true
      });
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_formulario`, erro as Error);
      throw erro;
    }
  });
  
  it('deve preencher formulário com dados válidos', async () => {
    try {
      // Encontrar os campos do formulário
      // @ts-ignore - Função disponível via MCP-Playwright
      const campos = await mcp_playwright_playwright_evaluate({
        script: `
          const form = document.querySelector('${SELETORES.FORMULARIO_CONTATO}');
          if (!form) return {};
          
          return {
            nome: form.querySelector('input[name*="nome"], input[placeholder*="nome"], input[type="text"]:nth-child(1)'),
            email: form.querySelector('input[name*="email"], input[type="email"], input[placeholder*="email"]'),
            telefone: form.querySelector('input[name*="telefone"], input[name*="phone"], input[placeholder*="telefone"], input[placeholder*="celular"]'),
            assunto: form.querySelector('input[name*="assunto"], input[name*="subject"], input[placeholder*="assunto"]'),
            mensagem: form.querySelector('textarea')
          };
        `
      });
      
      // Preencher cada campo, verificando se ele existe
      if (campos.nome) {
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_fill({
          selector: SELETORES.FORMULARIO_CONTATO + ' input[name*="nome"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[placeholder*="nome"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[type="text"]:nth-child(1)',
          value: DADOS_VALIDOS.nome
        });
      }
      
      if (campos.email) {
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_fill({
          selector: SELETORES.FORMULARIO_CONTATO + ' input[name*="email"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[type="email"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[placeholder*="email"]',
          value: DADOS_VALIDOS.email
        });
      }
      
      if (campos.telefone) {
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_fill({
          selector: SELETORES.FORMULARIO_CONTATO + ' input[name*="telefone"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[name*="phone"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[placeholder*="telefone"], ' + 
                    SELETORES.FORMULARIO_CONTATO + ' input[placeholder*="celular"]',
          value: DADOS_VALIDOS.telefone
        });
      }
      
      if (campos.assunto) {
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_fill({
          selector: SELETORES.FORMULARIO_CONTATO + ' input[name*="assunto"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[name*="subject"], ' +
                    SELETORES.FORMULARIO_CONTATO + ' input[placeholder*="assunto"]',
          value: DADOS_VALIDOS.assunto
        });
      }
      
      if (campos.mensagem) {
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_fill({
          selector: SELETORES.FORMULARIO_CONTATO + ' textarea',
          value: DADOS_VALIDOS.mensagem
        });
      }
      
      // Capturar screenshot do formulário preenchido
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: `formulario_preenchido.png`,
        selector: SELETORES.FORMULARIO_CONTATO,
        savePng: true
      });
      
      // Nota: Não vamos submeter o formulário para não gerar dados falsos no sistema
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_preenchimento`, erro as Error);
      throw erro;
    }
  });
  
  it('deve validar campos obrigatórios', async () => {
    try {
      // Encontrar botão de enviar
      // @ts-ignore - Função disponível via MCP-Playwright
      const botaoEnviar = await mcp_playwright_playwright_evaluate({
        script: `
          const form = document.querySelector('${SELETORES.FORMULARIO_CONTATO}');
          if (!form) return null;
          
          // Buscar botão de envio
          const botao = form.querySelector('button[type="submit"], input[type="submit"], button:not([type]), .submit-button, [class*="submit"]');
          return botao ? true : false;
        `
      });
      
      expectWithScreenshot(
        botaoEnviar === true,
        'Botão de envio não encontrado no formulário',
        `${TEST_NAME}_botao_enviar`
      );
      
      if (botaoEnviar) {
        // Clicar no botão sem preencher nada
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_click({
          selector: `${SELETORES.FORMULARIO_CONTATO} button[type="submit"], ` +
                    `${SELETORES.FORMULARIO_CONTATO} input[type="submit"], ` +
                    `${SELETORES.FORMULARIO_CONTATO} button:not([type]), ` +
                    `${SELETORES.FORMULARIO_CONTATO} .submit-button, ` +
                    `${SELETORES.FORMULARIO_CONTATO} [class*="submit"]`
        });
        
        // Esperar possíveis mensagens de erro
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capturar screenshot com erros de validação
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_screenshot({
          name: `formulario_validacao.png`,
          selector: SELETORES.FORMULARIO_CONTATO,
          savePng: true
        });
        
        // Verificar se há mensagens de erro visíveis
        // @ts-ignore - Função disponível via MCP-Playwright
        const temMensagensErro = await mcp_playwright_playwright_evaluate({
          script: `
            const form = document.querySelector('${SELETORES.FORMULARIO_CONTATO}');
            if (!form) return false;
            
            // Procurar por elementos de erro comuns
            const erros = form.querySelectorAll('.error, .invalid-feedback, [class*="error"], [class*="invalid"], [style*="red"], .required:empty');
            
            // Procurar por campos com classe de erro
            const camposComErro = form.querySelectorAll('input:invalid, textarea:invalid, input[aria-invalid="true"], textarea[aria-invalid="true"]');
            
            return erros.length > 0 || camposComErro.length > 0;
          `
        });
        
        expectWithScreenshot(
          temMensagensErro === true,
          'Formulário não validou campos obrigatórios corretamente',
          `${TEST_NAME}_validacao`
        );
      }
    } catch (erro) {
      await capturarScreenshotErro(`${TEST_NAME}_validacao`, erro as Error);
      throw erro;
    }
  });
}); 