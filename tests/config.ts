/**
 * Configuração global para testes do site Casa Sorveteiro
 */

// URL base do site
export const BASE_URL = 'https://turvicam-quem-somos-lp-frontend.vercel.app/';

// Tempo máximo de espera em operações (em ms)
export const TIMEOUT = 30000;

// Diretório para salvar evidências de erros
export const EVIDENCIA_DIR = '../evidencias-erros';

// Dispositivos para testes responsivos
export const DISPOSITIVOS = {
  DESKTOP: {
    nome: 'Desktop',
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  },
  TABLET: {
    nome: 'Tablet',
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  },
  MOBILE: {
    nome: 'Mobile',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  }
};

// Seletores comuns no site
export const SELETORES = {
  HEADER: 'header',
  FOOTER: 'footer',
  LOGO: '.logo',
  MENU: 'nav.menu',
  WHATSAPP_BUTTON: '.whatsapp-button, .whatsapp-link, a[href*="whatsapp"]',
  MENU_HAMBURGER: '.hamburger-menu, .mobile-menu-toggle',
  BANNER_PRINCIPAL: '.banner-principal, .main-banner, #banner',
  PRODUTOS_DESTAQUE: '.produtos-destaque, .featured-products',
  BREADCRUMB: '.breadcrumb, .breadcrumbs, .breadcrumb-trail',
  FORMULARIO_CONTATO: 'form#contato, form.contact-form, .formulario-contato'
}; 