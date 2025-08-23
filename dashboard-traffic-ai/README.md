# 🚀 Dashboard Traffic AI

Um dashboard profissional e moderno para monitorar campanhas de tráfego pago em múltiplas plataformas. Desenvolvido com Next.js, Express.js e um design roxo/violeta elegante.

## ✨ Características

- 🎨 **Design Moderno**: Interface roxa/violeta com componentes elegantes
- 📊 **Métricas em Tempo Real**: Seguidores, impressões, engajamento, ROI, CPA
- 🔧 **Configuração de API Keys**: Interface intuitiva para configurar tokens
- 📈 **Gráficos Interativos**: Chart.js para visualizações dinâmicas
- 🎯 **Múltiplas Plataformas**: Instagram, Facebook, TikTok, Meta Ads, Google Ads
- 📱 **Responsivo**: Funciona perfeitamente em desktop e mobile
- ⚡ **Performance Otimizada**: Carregamento rápido e eficiente
- 🔒 **Seguro**: API keys armazenadas localmente

## 🏗️ Arquitetura

```
dashboard-traffic-ai/
├── frontend/              # Next.js + Tailwind + Chart.js
│   ├── src/
│   │   ├── app/          # Páginas principais
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── services/     # Serviços de API
│   │   ├── types/        # Tipos TypeScript
│   │   └── lib/          # Utilitários
├── backend/               # Express.js + SQLite
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── controllers/  # Controladores
│   │   └── app.js        # Servidor principal
│   └── .env              # Configurações
└── database/             # Banco SQLite
```

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <repository-url>
cd dashboard-traffic-ai
```

### 2. Configure o Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o arquivo .env com suas API keys
npm run dev
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Acesse o Dashboard

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🔧 Configuração das API Keys

### 1. Acesse as Configurações

Navegue para `/settings` no dashboard e configure suas API keys:

### 2. Plataformas Suportadas

- **Instagram**: Token do Facebook Developer
- **Facebook**: Token do Facebook Business Manager
- **Meta Ads**: Token do Ads Manager
- **TikTok**: Token do TikTok for Business
- **Google Ads**: Token da Google Ads API

### 3. Teste as Conexões

Use o botão "Testar Conexão" para verificar se suas keys estão funcionando.

## 📊 Funcionalidades

### Dashboard Principal
- Visão geral de todas as métricas
- Cards com indicadores principais
- Gráficos de tendência
- Performance por plataforma

### Métricas Detalhadas
- Análise por plataforma específica
- Gráficos de tendência temporal
- Tabelas com dados detalhados
- Filtros e busca

### Campanhas
- Lista de todas as campanhas
- Filtros por status e plataforma
- Métricas de performance
- Ações de gerenciamento

### Configurações
- Interface para API keys
- Teste de conexões
- Instruções de configuração

## 🎨 Design System

### Cores Principais
- **Roxo**: `#7c3aed` (Primary)
- **Violeta**: `#a855f7` (Secondary)
- **Gradientes**: Combinações roxo-violeta

### Componentes
- Cards com gradientes
- Sidebar colapsável
- Gráficos interativos
- Botões com hover effects

## 🔌 API Endpoints

### Métricas
- `GET /api/metrics/overview` - Visão geral
- `GET /api/metrics/platform/:platform` - Métricas por plataforma
- `GET /api/metrics/trends/:platform` - Dados de tendência

### Campanhas
- `GET /api/campaigns` - Lista de campanhas
- `POST /api/campaigns` - Criar campanha
- `PUT /api/campaigns/:id` - Atualizar campanha
- `DELETE /api/campaigns/:id` - Deletar campanha

### API Keys
- `GET /api/keys` - Obter configurações
- `POST /api/keys/update` - Atualizar keys
- `POST /api/keys/test` - Testar conexão

## 🛠️ Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm run dev    # Desenvolvimento com nodemon
npm start      # Produção
```

**Frontend:**
```bash
npm run dev    # Desenvolvimento
npm run build  # Build de produção
npm start      # Servidor de produção
```

### Estrutura de Dados

```typescript
// Métricas
interface Metrics {
  followers: number;
  impressions: number;
  engagement: number;
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
  cpc: number;
  cpm: number;
  roas: number;
}

// Campanha
interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  objective: string;
  budget: number;
  spend: number;
  // ... outras propriedades
}
```

## 🔒 Segurança

- API keys armazenadas em arquivo `.env`
- Validação de entrada em todas as rotas
- CORS configurado para desenvolvimento
- Sanitização de dados

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🚀 Deploy

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Heroku (Backend)
```bash
cd backend
# Configure as variáveis de ambiente
git push heroku main
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a documentação
2. Abra uma issue no GitHub
3. Entre em contato com a equipe

## 🎯 Roadmap

- [ ] Integração com APIs reais
- [ ] Relatórios em PDF
- [ ] Notificações em tempo real
- [ ] Múltiplos usuários
- [ ] Backup automático
- [ ] Análise de concorrência

---

**Desenvolvido com ❤️ pela equipe Traffic AI**