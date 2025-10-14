# DE x PARA Automation - Frontend

Interface web moderna para o sistema DE x PARA Mapper com design responsivo e tema escuro/claro.

## 🌟 Características

- Interface moderna e responsiva
- Tema claro/escuro com persistência
- Upload de planilhas Excel (.xlsx)
- Configuração de pesos de similaridade
- Feedback visual em tempo real
- Download automático do resultado
- Integração com Gemini AI
- SEO otimizado

## 📋 Pré-requisitos

- Node.js >= 16.0.0 (apenas para desenvolvimento)
- Navegador web moderno
- Backend do sistema rodando

## ⚙️ Instalação

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone <repository-url>
cd dexpara-automation/front
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:4173`

### Produção (Deploy)

Este é um site estático que pode ser deployado em qualquer serviço:

#### Vercel (Recomendado)
```bash
npm run deploy
```

#### Netlify
```bash
npm run build
# Upload da pasta dist para Netlify
```

#### Outros Serviços
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

## 🔧 Configuração

### URLs da API

O frontend detecta automaticamente o ambiente e usa a URL correta:

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: `https://dexpara-backend-production.up.railway.app`

Para alterar, edite a função `getApiBaseUrl()` no arquivo `script.js`.

## 📡 Funcionalidades

### Upload de Planilha
- Suporte para arquivos .xlsx e .xls
- Validação de formato antes do upload
- Conversão automática para base64

### Configuração de Pesos
- Interface intuitiva para ajustar pesos de ähnlichkeit
- Validação automática de valores
- Padrão: [0.4, 0.25, 0.2, 0.15]

### Processamento
- Loading states visuais
- Feedback detalhado de progresso
- Tratamento de erros robusto
- Download automático do resultado

### Tema
- Alternância entre tema claro e escuro
- Persistência da preferência no localStorage
- Ícones dinâmicos

## 📁 Estrutura do Projeto

```
front/
├── index.html           # Página principal
├── style.css           # Estilos CSS
├── script.js           # Lógica JavaScript
├── package.json         # Configuração NPM
├── vercel.json         # Configuração Vercel
├── netlify.toml        # Configuração Netlify
├── robots.txt          # Configuração SEO
├── sitemap.xml         # Mapa do site
├── site.webmanifest    # PWA manifest
└── README.md           # Esta documentação
```

## 🎨 Design System

### Cores (CSS Variables)
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6366f1;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --background: #ffffff;
  --surface: #f8fafc;
  --text: #1e293b;
  --border: #e2e8f0;
}
```

### Tipografia
- Font family: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700
- Responsive sizing com clamp()

### Componentes
- Cards com sombras sutis
- Botões com estados hover/focus
- Formulários com validação visual
- Tabelas responsivas

## 📱 Responsividade

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Recursos Mobile
- Touch-friendly buttons
- Swipe gestures
- Viewport otimized
- Performance otimizada

## 🔍 SEO

### Meta Tags
- Open Graph para redes sociais
- Twitter Cards
- Schema.org structured data
- Canonical URLs

### Performance
- Lazy loading de recursos
- Minificação automática
- Cache headers otimizados
- Core Web Vitals otimizado

## 🧪 Testes

### Conectividade
```javascript
// Testa conexão com backend
GET /api/health

// Testa API Gemini
GET /api/gemini/test
```

### Validação de Arquivo
- Formato .xlsx verificado
- Tamanho máximo verificado
- Conversão base64 testada

## 🚀 Deploy

### Vercel (Automático)
```bash
npm run deploy
```

### Manual
```bash
npm run build
# Upload dos arquivos para seu CDN
```

### Variáveis de Ambiente
Configure no serviço de deploy:
- `API_BASE_URL`: URL do backend (para produção)

## 🐛 Troubleshooting

### "Servidor não disponível"
1. Verifique se o backend está rodando
2. Confirme a URL da API no `script.js`
3. Teste conectividade: `curl http://localhost:3000/api/health`

### "Erro ao processar planilha"
1. Verifique formato do arquivo (.xlsx)
2. Confirme estrutura da planilha (abas "DE" e "RASTREIO")
3. Verifique logs do backend

### CORS Error
1. Configure CORS no backend
2. Adicione domínio no `CORS_ORIGIN`
3. Para desenvolvimento, use `http://localhost:4173`

## 📊 Analytics

### Métricas Trackadas
- Uploads de arquivo
- Tempo de processamento
- Taxa de sucesso/erro
- Uso de temas (claro/escuro)

### Privacy First
- Nenhum dado pessoal coletado
- Analytics anônimo
- GDPR compliant

## 🔮 Roadmap

- [ ] PWA support
- [ ] Multiple file upload
- [ ] Real-time progress
- [ ] Advanced filters
- [ ] Export formats (CSV, JSON)
- [ ] Batch processing

## 📝 Licença

MIT License - veja arquivo LICENSE para detalhes.

## 👨‍💻 Autor

João Ricci - [GitHub](https://github.com/joaoricci)

---

**Links Úteis:**
- [Documentação Gemini API](https://ai.google.dev/gemini-api/docs)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Vercel Static Sites](https://vercel.com/docs/concepts/sites)