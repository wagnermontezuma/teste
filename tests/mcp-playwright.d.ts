/**
 * Declarações de tipos para as funções do MCP-Playwright
 */

// Funções de navegação
declare function mcp_playwright_playwright_navigate(options: {
  url: string;
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  width?: number;
  height?: number;
  timeout?: number;
  waitUntil?: string;
}): Promise<void>;

// Funções de screenshot
declare function mcp_playwright_playwright_screenshot(options: {
  name: string;
  fullPage?: boolean;
  savePng?: boolean;
  storeBase64?: boolean;
  selector?: string;
  width?: number;
  height?: number;
  downloadsDir?: string;
}): Promise<string>;

// Funções de avaliação JavaScript
declare function mcp_playwright_playwright_evaluate(options: {
  script: string;
}): Promise<any>;

// Funções de clique
declare function mcp_playwright_playwright_click(options: {
  selector: string;
}): Promise<void>;

// Função para preencher campos
declare function mcp_playwright_playwright_fill(options: {
  selector: string;
  value: string;
}): Promise<void>;

// Função para selecionar de uma lista
declare function mcp_playwright_playwright_select(options: {
  selector: string;
  value: string;
}): Promise<void>;

// Função para hover
declare function mcp_playwright_playwright_hover(options: {
  selector: string;
}): Promise<void>;

// Funções para obter logs do console
declare function mcp_playwright_playwright_console_logs(options: {
  clear?: boolean;
  type?: 'all' | 'error' | 'warning' | 'log' | 'info' | 'debug';
  limit?: number;
  search?: string;
}): Promise<any[]>;

// Funções para obter conteúdo HTML
declare function mcp_playwright_playwright_get_visible_html(options: {
  random_string: string;
}): Promise<string>;

// Funções para obter texto visível
declare function mcp_playwright_playwright_get_visible_text(options: {
  random_string: string;
}): Promise<string>;

// Função para configurar User Agent
declare function mcp_playwright_playwright_custom_user_agent(options: {
  userAgent: string;
}): Promise<void>;

// Função para fechar o navegador
declare function mcp_playwright_playwright_close(options: {
  random_string: string;
}): Promise<void>;

// Função para pressionar teclas
declare function mcp_playwright_playwright_press_key(options: {
  key: string;
  selector?: string;
}): Promise<void>;

// Teste Runner
declare var describe: (name: string, fn: () => void) => void;
declare var it: (name: string, fn: () => Promise<void> | void) => void;
declare var beforeEach: (fn: () => Promise<void> | void) => void;
declare var afterEach: (fn: () => Promise<void> | void) => void;
declare var beforeAll: (fn: () => Promise<void> | void) => void;
declare var afterAll: (fn: () => Promise<void> | void) => void; 