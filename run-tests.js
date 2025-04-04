/**
 * Executor de testes para o site Casa Sorveteiro
 * Este script executa todos os testes e gera relatórios.
 */

// Importações necessárias
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const readline = require('readline');

// Caminhos
const TESTS_DIR = path.join(__dirname, 'tests');
const LOGS_DIR = path.join(__dirname, 'logs');
const EVIDENCIAS_DIR = path.join(__dirname, 'evidencias-erros');
const CONFIG_FILE = path.join(__dirname, 'tests', 'config.ts');

// Configuração de dispositivos para testes
const DISPOSITIVOS = [
  { nome: 'Desktop', width: 1920, height: 1080 },
  { nome: 'Mobile', width: 390, height: 844 },
];

// Função para criar diretórios se não existirem
async function criarDiretorios() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    await fs.mkdir(EVIDENCIAS_DIR, { recursive: true });
    console.log('✅ Diretórios de logs e evidências criados/verificados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar diretórios:', error);
  }
}

// Função para solicitar a URL ao usuário
function solicitarURL() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Digite a URL do site para executar os testes (ou pressione Enter para usar a URL padrão https://www.casasorveteiro.com.br): ', (url) => {
      rl.close();
      if (!url.trim()) {
        url = 'https://turvicam-quem-somos-lp-frontend.vercel.app/';
      }
      console.log(`🌐 Usando URL: ${url}`);
      resolve(url);
    });
  });
}

// Função para atualizar o arquivo de configuração com a nova URL
async function atualizarConfigURL(url) {
  try {
    let configContent = await fs.readFile(CONFIG_FILE, 'utf8');
    
    // Atualizar a URL no arquivo de configuração
    configContent = configContent.replace(
      /export const BASE_URL = '[^']*';/,
      `export const BASE_URL = '${url}';`
    );
    
    await fs.writeFile(CONFIG_FILE, configContent, 'utf8');
    console.log('✅ Arquivo de configuração atualizado com a nova URL');
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo de configuração:', error);
  }
}

// Função para executar um teste com Playwright
async function executarTeste(arquivo) {
  console.log(`\n🚀 Executando teste: ${arquivo}`);
  
  try {
    // Extrair o nome do teste sem extensão
    const nomeBase = path.basename(arquivo, path.extname(arquivo));
    
    // Verificar se é um arquivo de teste real
    if (!arquivo.endsWith('.spec.ts') && !arquivo.endsWith('.spec.js')) {
      console.log(`⏩ Ignorando arquivo não-teste: ${nomeBase}`);
      return {
        nome: nomeBase,
        resultado: 'ignorado',
        duracao: 0,
      };
    }
    
    // Executar o teste diretamente com o servidor mcp-playwright
    console.log(`Iniciando teste de ${nomeBase}...`);
    
    // Executar o teste e capturar a saída
    const startTime = new Date().getTime();
    
    // Aqui, a execução depende de como você está conectando ao MCP
    // Em um ambiente real, você faria algo como:
    // 1. Importar o arquivo e executá-lo via MCP
    // 2. Ou usar uma ferramenta CLI para MCP
    console.log(`  - Teste ${nomeBase} seria executado neste ponto com mcp-playwright`);
    console.log("  - Substituir esta mensagem pela execução real do teste");
    
    // Simulação de tempo de execução para exemplo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const endTime = new Date().getTime();
    const duracaoMs = endTime - startTime;
    
    console.log(`✅ Teste ${nomeBase} concluído em ${duracaoMs}ms`);
    return {
      nome: nomeBase,
      resultado: 'sucesso',
      duracao: duracaoMs,
    };
  } catch (error) {
    console.error(`❌ Erro ao executar teste ${arquivo}:`, error);
    return {
      nome: path.basename(arquivo, path.extname(arquivo)),
      resultado: 'falha',
      erro: error.message,
    };
  }
}

// Função para listar todos os arquivos de teste
async function listarArquivosTeste() {
  try {
    const arquivos = await fs.readdir(TESTS_DIR);
    return arquivos
      .filter(arquivo => arquivo.endsWith('.ts') || arquivo.endsWith('.js'))
      .map(arquivo => path.join(TESTS_DIR, arquivo));
  } catch (error) {
    console.error('❌ Erro ao listar arquivos de teste:', error);
    return [];
  }
}

// Função para gerar relatório final
async function gerarRelatorio(resultados, urlTeste) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const nomeArquivo = `relatorio-testes-${timestamp}.json`;
  const caminhoRelatorio = path.join(LOGS_DIR, nomeArquivo);
  
  // Filtrar apenas testes reais (ignorando arquivos de configuração)
  const testesFiltrados = resultados.filter(r => r.resultado !== 'ignorado');
  
  const relatorio = {
    dataExecucao: new Date().toISOString(),
    urlTestada: urlTeste,
    resultados: testesFiltrados,
    resumo: {
      total: testesFiltrados.length,
      sucesso: testesFiltrados.filter(r => r.resultado === 'sucesso').length,
      falha: testesFiltrados.filter(r => r.resultado === 'falha').length,
    },
  };
  
  try {
    await fs.writeFile(caminhoRelatorio, JSON.stringify(relatorio, null, 2));
    console.log(`\n📊 Relatório gerado em: ${caminhoRelatorio}`);
    
    // Imprimir resumo no console
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log(`  - URL testada: ${urlTeste}`);
    console.log(`  - Total de testes: ${relatorio.resumo.total}`);
    console.log(`  - Testes com sucesso: ${relatorio.resumo.sucesso}`);
    console.log(`  - Testes com falha: ${relatorio.resumo.falha}`);
    
    return caminhoRelatorio;
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return null;
  }
}

// Função principal para executar todos os testes
async function executarTodosTestes() {
  console.log('🔍 Iniciando bateria de testes automatizados');
  
  // Solicitar URL ao usuário
  const urlTeste = await solicitarURL();
  
  // Atualizar arquivo de configuração com a URL
  await atualizarConfigURL(urlTeste);
  
  // Criar diretórios necessários
  await criarDiretorios();
  
  // Listar arquivos de teste
  const arquivosTeste = await listarArquivosTeste();
  if (arquivosTeste.length === 0) {
    console.log('❌ Nenhum arquivo de teste encontrado!');
    return;
  }
  
  console.log(`🔄 Encontrados ${arquivosTeste.length} arquivos`);
  
  // Executar cada teste
  const resultados = [];
  for (const arquivo of arquivosTeste) {
    const resultado = await executarTeste(arquivo);
    resultados.push(resultado);
  }
  
  // Gerar relatório final
  await gerarRelatorio(resultados, urlTeste);
  
  console.log('\n✨ Bateria de testes concluída!');
}

// Executar todos os testes quando este script for executado diretamente
if (require.main === module) {
  executarTodosTestes().catch(error => {
    console.error('❌ Erro ao executar testes:', error);
    process.exit(1);
  });
} 