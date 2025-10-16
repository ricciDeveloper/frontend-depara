// Configuração da API para o frontend
export const API_CONFIG = {
  // URL base do backend
  BASE_URL: 'https://backend-depara.onrender.com',
  
  // Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    GEMINI_TEST: '/api/gemini/test',
    PROCESS: '/api/process',
    GEMINI_ENHANCE: '/api/gemini/enhance',
    PROGRESS: '/api/progress'
  },
  
  // Configurações de requisição
  REQUEST_CONFIG: {
    timeout: 300000, // 5 minutos para processamento
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // Configurações de CORS
  CORS_CONFIG: {
    credentials: true,
    mode: 'cors'
  }
};

// Função para obter URL completa do endpoint
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para fazer requisições com configuração padrão
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...options.headers
    }
  };
  
  return fetch(url, defaultOptions);
};

// Exportar configuração para uso global
window.API_CONFIG = API_CONFIG;
window.getApiUrl = getApiUrl;
window.apiRequest = apiRequest;
