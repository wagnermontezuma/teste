/**
 * Utilidades para testes do site Casa Sorveteiro
 */
import { EVIDENCIA_DIR } from './config';

/**
 * Gera um ID único para screenshots baseado no nome do teste e timestamp
 */
export function gerarScreenshotId(testeName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${testeName}_${timestamp}`;
}

/**
 * Captura screenshot em caso de erro
 */
export async function capturarScreenshotErro(testeName: string, erro: Error): Promise<string> {
  const screenshotId = gerarScreenshotId(testeName);
  const filename = `erro_${screenshotId}.png`;
  const filepath = `${EVIDENCIA_DIR}/${filename}`;
  
  try {
    // @ts-ignore - Função disponível via MCP-Playwright
    await mcp_playwright_playwright_screenshot({
      name: filename,
      fullPage: true,
      savePng: true
    });
    
    console.error(`❌ Erro em ${testeName}: ${erro.message}`);
    console.log(`📸 Screenshot capturado: ${filepath}`);
    return filepath;
  } catch (e) {
    console.error(`❌ Erro ao capturar screenshot: ${e}`);
    return '';
  }
}

/**
 * Função customizada para expect com captura de screenshot
 */
export function expectWithScreenshot(condition: boolean, message: string, testeName: string): void {
  if (!condition) {
    const erro = new Error(message);
    capturarScreenshotErro(testeName, erro);
    throw erro;
  }
}

/**
 * Verifica se um elemento está visível na página
 */
export async function elementoVisivel(selector: string): Promise<boolean> {
  try {
    // @ts-ignore - Função disponível via MCP-Playwright
    const visivel = await mcp_playwright_playwright_evaluate({
      script: `
        (selector) => {
          const elemento = document.querySelector(selector);
          if (!elemento) return false;
          
          const style = window.getComputedStyle(elemento);
          return elemento.offsetWidth > 0 && 
                 elemento.offsetHeight > 0 && 
                 style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0';
        }
      `.replace(/selector/g, JSON.stringify(selector))
    });
    
    return !!visivel;
  } catch (e) {
    console.error(`❌ Erro ao verificar visibilidade de ${selector}: ${e}`);
    return false;
  }
}

/**
 * Espera até que um elemento esteja visível
 */
export async function esperarElementoVisivel(selector: string, timeout: number = 5000): Promise<boolean> {
  const inicio = Date.now();
  
  while (Date.now() - inicio < timeout) {
    if (await elementoVisivel(selector)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Obtém o conteúdo HTML visível da página
 */
export async function obterConteudoHtml(): Promise<string> {
  try {
    // @ts-ignore - Função disponível via MCP-Playwright
    return await mcp_playwright_playwright_get_visible_html({
      random_string: 'dummy'
    });
  } catch (e) {
    console.error(`❌ Erro ao obter HTML visível: ${e}`);
    return '';
  }
}

/**
 * Obtém registros do console
 */
export async function obterLogsConsole(): Promise<any[]> {
  try {
    // @ts-ignore - Função disponível via MCP-Playwright
    return await mcp_playwright_playwright_console_logs({
      type: 'all'
    });
  } catch (e) {
    console.error(`❌ Erro ao obter logs do console: ${e}`);
    return [];
  }
} 