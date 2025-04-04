import path from 'path';
import fs from 'fs';

// Interface para o resultado dos testes
interface ResultadoTeste {
  sucesso: boolean;
  erros: string[];
  evidencias: string[];
}

// Funções para geração de nomes de arquivos
function gerarNomeArquivo(prefixo: string): string {
  const timestamp = new Date().toISOString()
    .replace(/T/, '-')
    .replace(/:/g, '')
    .replace(/\..+/, '');
  return `${prefixo}-${timestamp}.png`;
}

// Função para garantir que o diretório de evidências exista
function garantirDiretorioEvidencias(): string {
  const diretorioEvidencias = path.join(__dirname, '..', 'evidencias-erros');
  if (!fs.existsSync(diretorioEvidencias)) {
    fs.mkdirSync(diretorioEvidencias, { recursive: true });
  }
  return diretorioEvidencias;
}

/**
 * Testa se a página responde com status 200
 */
async function testarStatus200(url: string): Promise<{ sucesso: boolean; erro?: string; evidencia?: string }> {
  try {
    // @ts-ignore - Função disponível via MCP-Playwright
    const resposta = await mcp_playwright_playwright_navigate({
      url,
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Verificamos se a resposta foi bem-sucedida
    // @ts-ignore - Função disponível via MCP-Playwright
    const logs = await mcp_playwright_playwright_console_logs({
      type: 'all'
    });
    
    // Verificar se há erros nos logs que indicam falha no carregamento
    const errosStatusHttp = logs.filter(log => 
      log.type === 'error' && 
      (log.text?.includes('status=4') || log.text?.includes('status=5'))
    );
    
    if (errosStatusHttp.length > 0) {
      // Capturar screenshot como evidência
      const diretorioEvidencias = garantirDiretorioEvidencias();
      const nomeArquivo = gerarNomeArquivo('erro-status');
      const caminhoArquivo = path.join(diretorioEvidencias, nomeArquivo);
      
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: nomeArquivo,
        fullPage: true,
        savePng: true,
        downloadsDir: diretorioEvidencias
      });
      
      return {
        sucesso: false,
        erro: `Página não retornou status 200. Erros: ${errosStatusHttp.map(e => e.text).join(', ')}`,
        evidencia: caminhoArquivo
      };
    }
    
    return { sucesso: true };
  } catch (error) {
    // Capturar screenshot como evidência
    const diretorioEvidencias = garantirDiretorioEvidencias();
    const nomeArquivo = gerarNomeArquivo('erro-acesso');
    const caminhoArquivo = path.join(diretorioEvidencias, nomeArquivo);
    
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: nomeArquivo,
        fullPage: true,
        savePng: true,
        downloadsDir: diretorioEvidencias
      });
    } catch (e) {
      console.error('Erro ao capturar screenshot:', e);
    }
    
    return {
      sucesso: false,
      erro: `Erro ao acessar a página: ${error instanceof Error ? error.message : String(error)}`,
      evidencia: caminhoArquivo
    };
  }
}

/**
 * Testa se elementos básicos estão presentes na página
 */
async function testarElementosBasicos(): Promise<{ sucesso: boolean; erros: string[]; evidencias: string[] }> {
  const elementosParaVerificar = [
    { nome: 'title', seletor: 'title', descricao: 'Título da página' },
    { nome: 'header', seletor: 'header, .header, #header, [role="banner"]', descricao: 'Cabeçalho' },
    { nome: 'footer', seletor: 'footer, .footer, #footer, [role="contentinfo"]', descricao: 'Rodapé' },
    { nome: 'nav', seletor: 'nav, .nav, #nav, [role="navigation"]', descricao: 'Menu de navegação' },
    { nome: 'main', seletor: 'main, .main, #main, [role="main"]', descricao: 'Conteúdo principal' }
  ];
  
  const erros: string[] = [];
  const evidencias: string[] = [];
  
  for (const elemento of elementosParaVerificar) {
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      const existe = await mcp_playwright_playwright_evaluate({
        script: `!!document.querySelector('${elemento.seletor}')`
      });
      
      if (!existe) {
        // Capturar screenshot como evidência
        const diretorioEvidencias = garantirDiretorioEvidencias();
        const nomeArquivo = gerarNomeArquivo(`elemento-ausente-${elemento.nome}`);
        const caminhoArquivo = path.join(diretorioEvidencias, nomeArquivo);
        
        // @ts-ignore - Função disponível via MCP-Playwright
        await mcp_playwright_playwright_screenshot({
          name: nomeArquivo,
          fullPage: true,
          savePng: true,
          downloadsDir: diretorioEvidencias
        });
        
        erros.push(`Elemento ${elemento.descricao} (${elemento.seletor}) não encontrado`);
        evidencias.push(caminhoArquivo);
      }
    } catch (error) {
      erros.push(`Erro ao verificar elemento ${elemento.descricao}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return {
    sucesso: erros.length === 0,
    erros,
    evidencias
  };
}

/**
 * Testa os links principais da página
 */
async function testarLinksPrincipais(): Promise<{ sucesso: boolean; erros: string[]; evidencias: string[] }> {
  try {
    // @ts-ignore - Função disponível via MCP-Playwright
    const links = await mcp_playwright_playwright_evaluate({
      script: `
        Array.from(document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript"]):not([href^="mailto"]):not([href^="tel"])'))
        .filter(link => {
          const rect = link.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && 
                 window.getComputedStyle(link).display !== 'none' &&
                 window.getComputedStyle(link).visibility !== 'hidden';
        })
        .slice(0, 5) // Limitar aos 5 primeiros links para não tornar o teste muito longo
        .map(link => ({
          texto: link.textContent.trim(),
          href: link.href,
          rect: link.getBoundingClientRect()
        }));
      `
    });
    
    const erros: string[] = [];
    const evidencias: string[] = [];
    
    // Se não encontrou links visíveis
    if (!links || links.length === 0) {
      const diretorioEvidencias = garantirDiretorioEvidencias();
      const nomeArquivo = gerarNomeArquivo('sem-links');
      const caminhoArquivo = path.join(diretorioEvidencias, nomeArquivo);
      
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: nomeArquivo,
        fullPage: true,
        savePng: true,
        downloadsDir: diretorioEvidencias
      });
      
      erros.push('Nenhum link principal encontrado na página');
      evidencias.push(caminhoArquivo);
      
      return { sucesso: false, erros, evidencias };
    }
    
    // Para este teste, não vamos navegar para os links, apenas verificar se eles existem
    // Em um teste real, poderíamos testar cada link de forma mais completa
    
    return {
      sucesso: true,
      erros: [],
      evidencias: []
    };
  } catch (error) {
    const diretorioEvidencias = garantirDiretorioEvidencias();
    const nomeArquivo = gerarNomeArquivo('erro-links');
    const caminhoArquivo = path.join(diretorioEvidencias, nomeArquivo);
    
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_screenshot({
        name: nomeArquivo,
        fullPage: true,
        savePng: true,
        downloadsDir: diretorioEvidencias
      });
    } catch (e) {
      console.error('Erro ao capturar screenshot:', e);
    }
    
    return {
      sucesso: false,
      erros: [`Erro ao verificar links principais: ${error instanceof Error ? error.message : String(error)}`],
      evidencias: [caminhoArquivo]
    };
  }
}

/**
 * Função principal que executa todos os testes
 */
export async function executarTestesPagina(url: string, width: number = 1920, height: number = 1080): Promise<ResultadoTeste> {
  let erros: string[] = [];
  let evidencias: string[] = [];
  let sucesso = true;
  
  try {
    console.log(`📝 Iniciando testes para ${url} com resolução ${width}x${height}`);
    
    // Configurar navegador com a resolução especificada
    // @ts-ignore - Função disponível via MCP-Playwright
    await mcp_playwright_playwright_navigate({
      url: 'about:blank', // Página temporária
      width,
      height,
      headless: true
    });
    
    // Teste 1: Verificar status 200
    console.log('🧪 Teste: Verificar status 200');
    const resultadoStatus = await testarStatus200(url);
    if (!resultadoStatus.sucesso) {
      sucesso = false;
      erros.push(resultadoStatus.erro!);
      if (resultadoStatus.evidencia) {
        evidencias.push(resultadoStatus.evidencia);
      }
    }
    
    // Se conseguiu acessar a página, continuar com os outros testes
    if (resultadoStatus.sucesso) {
      // Teste 2: Verificar elementos básicos
      console.log('🧪 Teste: Verificar elementos básicos');
      const resultadoElementos = await testarElementosBasicos();
      if (!resultadoElementos.sucesso) {
        sucesso = false;
        erros = [...erros, ...resultadoElementos.erros];
        evidencias = [...evidencias, ...resultadoElementos.evidencias];
      }
      
      // Teste 3: Verificar links principais
      console.log('🧪 Teste: Verificar links principais');
      const resultadoLinks = await testarLinksPrincipais();
      if (!resultadoLinks.sucesso) {
        sucesso = false;
        erros = [...erros, ...resultadoLinks.erros];
        evidencias = [...evidencias, ...resultadoLinks.evidencias];
      }
    }
    
    // Fechar navegador
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_close({
        random_string: 'close-browser'
      });
    } catch (e) {
      console.warn('Aviso: Erro ao fechar navegador:', e);
    }
    
    return {
      sucesso,
      erros,
      evidencias
    };
  } catch (error) {
    // Capturar erro geral
    const mensagemErro = `Erro ao executar testes: ${error instanceof Error ? error.message : String(error)}`;
    console.error('❌', mensagemErro);
    
    // Tentar fechar navegador em caso de erro
    try {
      // @ts-ignore - Função disponível via MCP-Playwright
      await mcp_playwright_playwright_close({
        random_string: 'close-browser'
      });
    } catch (e) {
      console.warn('Aviso: Erro ao fechar navegador:', e);
    }
    
    return {
      sucesso: false,
      erros: [mensagemErro],
      evidencias
    };
  }
} 