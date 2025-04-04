// Teste simples para verificar se conseguimos acessar o servidor MCP-Playwright
// Execute com: node tests/mcp-test.js

const http = require('http');

// Função para fazer uma requisição ao servidor MCP-Playwright
function mcp_request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    const options = {
      hostname: 'localhost',
      port: 8080, // Porta padrão do MCP-Playwright
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          if (jsonResponse.error) {
            reject(new Error(`MCP Error: ${JSON.stringify(jsonResponse.error)}`));
          } else {
            resolve(jsonResponse.result);
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}, Response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    req.write(data);
    req.end();
  });
}

async function testarUrl(url) {
  try {
    console.log(`🔍 Iniciando teste para: ${url}`);

    // 1. Navegar para a URL
    console.log('Navegando para a URL...');
    await mcp_request('playwright/navigate', {
      url,
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ Navegação bem-sucedida');

    // 2. Capturar screenshot
    console.log('Capturando screenshot...');
    const screenshot = await mcp_request('playwright/screenshot', {
      name: 'turvicam-test',
      fullPage: true,
      savePng: true
    });
    console.log(`✅ Screenshot capturado: ${screenshot}`);

    // 3. Verificar o título da página
    console.log('Verificando o título da página...');
    const title = await mcp_request('playwright/evaluate', {
      script: 'document.title'
    });
    console.log(`✅ Título da página: ${title}`);

    // 4. Verificar elementos básicos
    console.log('Verificando elementos básicos...');
    const elementosParaVerificar = [
      { nome: 'header', seletor: 'header, .header, #header, [role="banner"]' },
      { nome: 'footer', seletor: 'footer, .footer, #footer, [role="contentinfo"]' },
      { nome: 'navigation', seletor: 'nav, .nav, #nav, [role="navigation"]' }
    ];

    for (const elemento of elementosParaVerificar) {
      const existe = await mcp_request('playwright/evaluate', {
        script: `!!document.querySelector('${elemento.seletor}')`
      });
      console.log(`✅ Elemento ${elemento.nome}: ${existe ? 'Encontrado' : 'Não encontrado'}`);
    }

    // 5. Fechar o navegador
    console.log('Fechando o navegador...');
    await mcp_request('playwright/close', {
      random_string: 'close-browser'
    });
    console.log('✅ Navegador fechado');

    console.log('✅ Teste concluído com sucesso');
  } catch (error) {
    console.error(`❌ Erro no teste: ${error.message}`);
  }
}

// URL a ser testada
const url = 'https://turvicam-conta-global-lp-fontend.vercel.app/';
testarUrl(url); 