// Script de teste adaptado para verificar o site Turvicam sem depender do MCP-Playwright
const https = require('https');
const fs = require('fs');
const path = require('path');

// Função para fazer uma requisição HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Função para verificar elementos básicos na resposta HTML
function verificarElementos(html) {
  const elementos = [
    { nome: 'title', regex: /<title[^>]*>(.+?)<\/title>/i, descricao: 'Título da página' },
    { nome: 'header', regex: /<header|class=["']header|id=["']header|role=["']banner["']/i, descricao: 'Cabeçalho' },
    { nome: 'footer', regex: /<footer|class=["']footer|id=["']footer|role=["']contentinfo["']/i, descricao: 'Rodapé' },
    { nome: 'nav', regex: /<nav|class=["']nav|id=["']nav|role=["']navigation["']/i, descricao: 'Menu de navegação' },
    { nome: 'main', regex: /<main|class=["']main|id=["']main|role=["']main["']/i, descricao: 'Conteúdo principal' }
  ];
  
  const resultados = elementos.map(elemento => {
    const encontrado = elemento.regex.test(html);
    return {
      nome: elemento.nome,
      descricao: elemento.descricao,
      encontrado
    };
  });
  
  return resultados;
}

// Função para salvar o relatório de teste
function salvarRelatorio(relatorio) {
  const diretorioLogs = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(diretorioLogs)) {
    fs.mkdirSync(diretorioLogs, { recursive: true });
  }
  
  const timestamp = new Date().toISOString();
  const nomeArquivo = `relatorio-testes-${timestamp}.json`;
  const caminhoArquivo = path.join(diretorioLogs, nomeArquivo);
  
  fs.writeFileSync(caminhoArquivo, JSON.stringify(relatorio, null, 2));
  console.log(`✅ Relatório salvo em: ${caminhoArquivo}`);
  
  return caminhoArquivo;
}

// Função principal para testar a URL
async function testarUrl(url) {
  console.log(`🔍 Iniciando teste para: ${url}`);
  const inicioTeste = Date.now();
  
  try {
    // 1. Fazer requisição HTTP para a URL
    console.log('Verificando resposta HTTP...');
    const resposta = await makeRequest(url);
    
    // 2. Verificar código de status
    console.log(`Status: ${resposta.statusCode}`);
    const statusOk = resposta.statusCode >= 200 && resposta.statusCode < 400;
    console.log(`Tempo de resposta: ${resposta.responseTime}ms`);
    
    // 3. Verificar elementos básicos
    console.log('Verificando elementos básicos...');
    const elementosVerificados = verificarElementos(resposta.body);
    
    // 4. Verificar links principais
    console.log('Verificando links principais...');
    const linksRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(https?:\/\/[^"']+)\1/gi;
    const links = [];
    let match;
    while ((match = linksRegex.exec(resposta.body)) !== null) {
      links.push(match[2]);
    }
    
    // 5. Preparar resultado
    const fimTeste = Date.now();
    const tempoTotal = (fimTeste - inicioTeste) / 1000;
    
    const resultado = {
      url,
      timestamp: new Date().toISOString(),
      sucesso: statusOk && elementosVerificados.every(e => e.encontrado),
      tempoTotal: `${tempoTotal.toFixed(2)}s`,
      statusCode: resposta.statusCode,
      tempoResposta: `${resposta.responseTime}ms`,
      elementos: elementosVerificados,
      links: links.slice(0, 5), // Limitando a 5 links
      erros: []
    };
    
    // Identificar erros
    if (!statusOk) {
      resultado.erros.push(`Status HTTP inválido: ${resposta.statusCode}`);
    }
    
    elementosVerificados.forEach(elemento => {
      if (!elemento.encontrado) {
        resultado.erros.push(`Elemento não encontrado: ${elemento.descricao}`);
      }
    });
    
    // 6. Salvar relatório
    const caminhoRelatorio = salvarRelatorio(resultado);
    
    // 7. Exibir resumo
    console.log('\n📊 RESUMO DO TESTE');
    console.log(`URL: ${url}`);
    console.log(`Status: ${resultado.sucesso ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`Código de status: ${resposta.statusCode}`);
    console.log(`Tempo total: ${resultado.tempoTotal}`);
    console.log(`Elementos verificados: ${elementosVerificados.filter(e => e.encontrado).length}/${elementosVerificados.length}`);
    console.log(`Links encontrados: ${links.length}`);
    console.log(`Erros: ${resultado.erros.length}`);
    
    if (resultado.erros.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      resultado.erros.forEach((erro, index) => {
        console.log(`${index + 1}. ${erro}`);
      });
    }
    
    console.log(`\n📝 Relatório completo: ${caminhoRelatorio}`);
    
    return resultado;
  } catch (error) {
    console.error(`❌ Erro ao testar URL: ${error.message}`);
    
    const resultado = {
      url,
      timestamp: new Date().toISOString(),
      sucesso: false,
      tempoTotal: ((Date.now() - inicioTeste) / 1000).toFixed(2) + 's',
      erros: [`Erro durante o teste: ${error.message}`]
    };
    
    salvarRelatorio(resultado);
    return resultado;
  }
}

// Executar o teste
if (require.main === module) {
  const url = process.argv[2] || 'https://turvicam-conta-global-lp-fontend.vercel.app/';
  testarUrl(url)
    .then(() => console.log('✅ Teste concluído'))
    .catch(error => console.error('❌ Erro:', error.message));
}

module.exports = { testarUrl }; 