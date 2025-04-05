import { Page } from 'playwright';

interface ResultadoAnalise {
  nota_geral: number;
  problemas_detectados: string[];
  print_das_telas: string[];
  tempo_execucao: string;
}

interface CriterioAvaliacao {
  nome: string;
  peso: number;
  valor: number;
  problemas: string[];
}

export async function avaliarLayout(page: Page, url: string): Promise<ResultadoAnalise> {
  const inicio = Date.now();
  const problemas: string[] = [];
  const criterios: CriterioAvaliacao[] = [];

  // Configurar viewport para desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url);
  
  // Capturar screenshot desktop
  await page.screenshot({ path: 'evidencias-uxui/desktop.png', fullPage: true });

  // Avaliar critérios desktop
  await avaliarHierarquiaVisual(page, criterios, problemas);
  await avaliarContraste(page, criterios, problemas);
  await avaliarNavegacao(page, criterios, problemas);
  await avaliarAcessibilidade(page, criterios, problemas);
  await avaliarCTA(page, criterios, problemas);

  // Configurar viewport para mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(url);

  // Capturar screenshot mobile
  await page.screenshot({ path: 'evidencias-uxui/mobile.png', fullPage: true });

  // Avaliar critérios mobile
  await avaliarResponsividade(page, criterios, problemas);

  const nota = calcularNotaUXUI(criterios);
  const tempoExecucao = ((Date.now() - inicio) / 1000).toFixed(1) + 's';

  return {
    nota_geral: nota,
    problemas_detectados: problemas,
    print_das_telas: ['evidencias-uxui/desktop.png', 'evidencias-uxui/mobile.png'],
    tempo_execucao: tempoExecucao
  };
}

async function avaliarHierarquiaVisual(page: Page, criterios: CriterioAvaliacao[], problemas: string[]) {
  const criterio: CriterioAvaliacao = {
    nome: 'Hierarquia Visual',
    peso: 2,
    valor: 0,
    problemas: []
  };

  const h1Count = await page.$$eval('h1', elements => elements.length);
  const h2Count = await page.$$eval('h2', elements => elements.length);
  
  if (h1Count === 0) {
    criterio.problemas.push('Página não possui título principal (h1)');
  }
  
  if (h2Count === 0) {
    criterio.problemas.push('Página não possui subtítulos (h2)');
  }

  criterio.valor = h1Count === 1 && h2Count > 0 ? 10 : 5;
  problemas.push(...criterio.problemas);
  criterios.push(criterio);
}

async function avaliarContraste(page: Page, criterios: CriterioAvaliacao[], problemas: string[]) {
  const criterio: CriterioAvaliacao = {
    nome: 'Contraste',
    peso: 1.5,
    valor: 0,
    problemas: []
  };

  const elementos = await page.$$eval('*', elements => {
    return elements.map(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor
      };
    });
  });

  let problemasContraste = 0;
  elementos.forEach(el => {
    if (!verificarContrasteMinimo(el.color, el.backgroundColor)) {
      problemasContraste++;
    }
  });

  if (problemasContraste > 0) {
    criterio.problemas.push(`Detectados ${problemasContraste} elementos com contraste inadequado`);
  }

  criterio.valor = problemasContraste === 0 ? 10 : (10 - problemasContraste);
  problemas.push(...criterio.problemas);
  criterios.push(criterio);
}

async function avaliarNavegacao(page: Page, criterios: CriterioAvaliacao[], problemas: string[]) {
  const criterio: CriterioAvaliacao = {
    nome: 'Navegação',
    peso: 2,
    valor: 0,
    problemas: []
  };

  const menuExists = await page.$$eval('nav, [role="navigation"]', elements => elements.length > 0);
  const linksCount = await page.$$eval('a', elements => elements.length);

  if (!menuExists) {
    criterio.problemas.push('Não foi encontrado menu de navegação principal');
  }

  if (linksCount < 5) {
    criterio.problemas.push('Poucos links de navegação encontrados');
  }

  criterio.valor = menuExists && linksCount >= 5 ? 10 : 5;
  problemas.push(...criterio.problemas);
  criterios.push(criterio);
}

async function avaliarAcessibilidade(page: Page, criterios: CriterioAvaliacao[], problemas: string[]) {
  const criterio: CriterioAvaliacao = {
    nome: 'Acessibilidade',
    peso: 2,
    valor: 0,
    problemas: []
  };

  const imagens = await page.$$eval('img', imgs => 
    imgs.filter(img => !img.getAttribute('alt')).length
  );

  const forms = await page.$$eval('input', inputs => 
    inputs.filter(input => !input.getAttribute('aria-label') && !input.getAttribute('placeholder')).length
  );

  if (imagens > 0) {
    criterio.problemas.push(`${imagens} imagens sem atributo alt`);
  }

  if (forms > 0) {
    criterio.problemas.push(`${forms} campos de formulário sem label ou placeholder`);
  }

  criterio.valor = (imagens === 0 && forms === 0) ? 10 : (10 - (imagens + forms));
  problemas.push(...criterio.problemas);
  criterios.push(criterio);
}

async function avaliarCTA(page: Page, criterios: CriterioAvaliacao[], problemas: string[]) {
  const criterio: CriterioAvaliacao = {
    nome: 'Call to Action',
    peso: 1.5,
    valor: 0,
    problemas: []
  };

  const botoes = await page.$$eval('button, .btn, [role="button"], a.button', buttons => {
    return buttons.map(btn => {
      const style = window.getComputedStyle(btn);
      return {
        texto: btn.textContent?.trim(),
        visivel: style.display !== 'none' && style.visibility !== 'hidden',
        tamanho: parseInt(style.fontSize)
      };
    });
  });

  if (botoes.length === 0) {
    criterio.problemas.push('Nenhum botão de CTA encontrado');
    criterio.valor = 0;
  } else {
    const botoesInvalidos = botoes.filter(btn => 
      !btn.visivel || !btn.texto || btn.texto.length < 2 || btn.tamanho < 14
    );

    if (botoesInvalidos.length > 0) {
      criterio.problemas.push('CTAs com problemas de visibilidade ou legibilidade');
    }

    criterio.valor = 10 - (botoesInvalidos.length * 2);
  }

  problemas.push(...criterio.problemas);
  criterios.push(criterio);
}

async function avaliarResponsividade(page: Page, criterios: CriterioAvaliacao[], problemas: string[]) {
  const criterio: CriterioAvaliacao = {
    nome: 'Responsividade',
    peso: 2,
    valor: 0,
    problemas: []
  };

  // Verificar overflow horizontal
  const temOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  // Verificar menu mobile
  const menuMobileVisivel = await page.$$eval(
    'nav, [role="navigation"]',
    elements => elements.some(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    })
  );

  if (temOverflow) {
    criterio.problemas.push('Página apresenta scroll horizontal em mobile');
  }

  if (!menuMobileVisivel) {
    criterio.problemas.push('Menu não está visível em versão mobile');
  }

  criterio.valor = (!temOverflow && menuMobileVisivel) ? 10 : 5;
  problemas.push(...criterio.problemas);
  criterios.push(criterio);
}

function calcularNotaUXUI(criterios: CriterioAvaliacao[]): number {
  const somaPesos = criterios.reduce((acc, curr) => acc + curr.peso, 0);
  const somaNotas = criterios.reduce((acc, curr) => acc + (curr.valor * curr.peso), 0);
  
  return Number((somaNotas / somaPesos).toFixed(1));
}

function verificarContrasteMinimo(cor1: string, cor2: string): boolean {
  // Implementação simplificada - em produção usar biblioteca específica
  // como 'color-contrast-checker'
  return true;
} 