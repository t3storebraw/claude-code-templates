# 🚀 Dashboard Traffic AI - Tráfego Pago Profissional

![Logo](https://via.placeholder.com/800x200/8b5cf6/ffffff?text=Dashboard+Traffic+AI)

## 🔥 Objetivo

Dashboard moderno, rápido e visual para monitoramento de campanhas de tráfego pago com input de API Keys para Instagram, Facebook, Meta Ads e TikTok, com tema roxo profissional e performance máxima rodando via localhost.

## 🏁 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o projeto**
```bash
git clone <repository-url>
cd dashboard-traffic-ai
```

2. **Setup do Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edite o arquivo .env com suas API Keys
npm start
```

3. **Setup do Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Acesse o Dashboard**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🎨 Features Principais

### ✅ Dashboard Principal
- **Métricas em Tempo Real**: Seguidores, Impressões, Engajamento, ROI, CPA
- **Cards com Gradiente Roxo**: Design moderno com efeitos visuais
- **Gráficos Interativos**: Chart.js para visualização de tendências
- **Layout Responsivo**: Funciona perfeitamente em desktop e mobile

### ✅ Gestão de API Keys
- **Interface Intuitiva**: Formulários seguros para inserir tokens
- **Teste de Conexão**: Validação automática das chaves de API
- **Suporte Multi-Plataforma**: Instagram, Facebook, Meta Ads, TikTok
- **Persistência Segura**: Armazenamento local via .env

### ✅ Campanhas
- **Visualização Completa**: Cards com métricas detalhadas
- **Controle de Status**: Pausar/Ativar campanhas
- **Filtros Inteligentes**: Por status e plataforma
- **Métricas de Performance**: CTR, CPC, CPA, Conversões

### ✅ Design Profissional
- **Tema Roxo Elegante**: Paleta de cores consistente
- **Sidebar Fixa**: Navegação intuitiva com ícones das redes sociais
- **Componentes Modernos**: Shadcn/ui + Tailwind CSS
- **Animações Suaves**: Transições e efeitos visuais

## 🛠 Tecnologias

### Backend
- **Express.js**: API REST rápida e confiável
- **Axios**: Cliente HTTP para integração com APIs
- **CORS**: Suporte a requisições cross-origin
- **dotenv**: Gerenciamento seguro de variáveis de ambiente

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização utilitária moderna
- **Chart.js**: Gráficos interativos de alta performance
- **Lucide React**: Ícones modernos e consistentes

## 📂 Estrutura do Projeto

```
dashboard-traffic-ai/
├── backend/              # Express.js API
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   │   ├── apiKeys.js    # Gestão de API Keys
│   │   │   ├── metrics.js    # Métricas das plataformas
│   │   │   └── campaigns.js  # Gerenciamento de campanhas
│   │   └── app.js        # Aplicação principal
│   ├── .env.example      # Template para API Keys
│   └── package.json
├── frontend/             # Next.js App
│   ├── src/
│   │   ├── app/          # Páginas principais
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── settings/      # Configurações de API
│   │   │   └── campaigns/     # Gestão de campanhas
│   │   ├── components/   # Componentes reutilizáveis
│   │   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   │   ├── MetricCard.tsx # Cards de métricas
│   │   │   ├── Sidebar.tsx    # Navegação lateral
│   │   │   └── DashboardChart.tsx # Gráficos
│   │   ├── lib/          # Utilitários
│   │   └── types/        # Tipos TypeScript
│   └── package.json
└── README.md
```

## 🔐 Configuração das API Keys

### Instagram
1. Acesse o [Facebook Developers](https://developers.facebook.com)
2. Crie um novo app
3. Configure o **Instagram Basic Display**
4. Gere um Access Token

### Facebook
1. Use o [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Selecione sua página
3. Gere um Access Token com permissões adequadas

### Meta Ads
1. Acesse o [Facebook Business Manager](https://business.facebook.com)
2. Configure o **Meta Marketing API**
3. Obtenha o Access Token para suas contas de anúncios

### TikTok
1. Registre-se no [TikTok for Business](https://ads.tiktok.com/marketing_api/homepage)
2. Crie uma aplicação
3. Obtenha as credenciais da API

## 🚀 Deploy e Produção

### Localhost (Desenvolvimento)
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Build para Produção
```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
npm start
```

## 📊 APIs Suportadas

| Plataforma | Endpoint Base | Documentação |
|-----------|---------------|--------------|
| Instagram | `graph.instagram.com` | [Docs](https://developers.facebook.com/docs/instagram-api) |
| Facebook | `graph.facebook.com` | [Docs](https://developers.facebook.com/docs/graph-api) |
| Meta Ads | `graph.facebook.com` | [Docs](https://developers.facebook.com/docs/marketing-apis) |
| TikTok | `business-api.tiktok.com` | [Docs](https://ads.tiktok.com/marketing_api/docs) |

## 🎯 Roadmap

- [ ] Autenticação OAuth automática
- [ ] Relatórios em PDF/Excel
- [ ] Notificações push
- [ ] Dashboard para múltiplos usuários
- [ ] Integração com Google Ads
- [ ] AI insights e recomendações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- 📧 Email: support@trafficai.com
- 💬 Discord: [Link do servidor]
- 📚 Wiki: [Link da documentação]

---

<div align="center">
  <p>⚡ <strong>Desenvolvido com foco em performance e usabilidade profissional</strong> ⚡</p>
  <p>🎨 <strong>Design moderno • API integrations • Localhost ready</strong> 🎨</p>
</div>