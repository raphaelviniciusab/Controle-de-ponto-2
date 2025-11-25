# 🚀 Guia de Deploy no Render

## 📋 Variáveis de Ambiente Necessárias

### Backend (Render Web Service)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Frontend (Render Static Site)
```
VITE_API_URL=https://controle-de-ponto-2.onrender.com
```

## 🔧 Configuração do Backend no Render

1. **Criar Web Service:**
   - Build Command: `cd backend && npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `cd backend && npm start`
   - Environment: Node

2. **Adicionar PostgreSQL:**
   - No dashboard do Render, adicione um PostgreSQL database
   - Copie a Internal Database URL
   - Cole na variável `DATABASE_URL`

3. **Configurar Variáveis de Ambiente:**
   - `DATABASE_URL`: URL do PostgreSQL (fornecida pelo Render)
   - `JWT_SECRET`: Gere uma chave segura (ex: senha aleatória)
   - `NODE_ENV`: production
   - `FRONTEND_URL`: URL do frontend após deploy

## 🎨 Configuração do Frontend no Render

1. **Criar Static Site:**
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Configurar Variável de Ambiente:**
   - `VITE_API_URL`: URL do backend (https://controle-de-ponto-2.onrender.com)

## ✅ Checklist de Deploy

- [ ] Backend deployado com PostgreSQL configurado
- [ ] Migrations do Prisma executadas
- [ ] Frontend deployado e acessível
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] CORS configurado com URL do frontend
- [ ] Teste de login funcionando
- [ ] CSS e estilos carregando corretamente

## 🔍 Troubleshooting

### Frontend sem estilos:
- Verifique se o build gerou a pasta `dist` corretamente
- Confirme que `base: '/'` está no vite.config.js
- Verifique os logs de build no Render

### Erro de CORS:
- Confirme que `FRONTEND_URL` no backend está correto
- Verifique se a URL não tem barra final (/)
- Teste com a ferramenta de Network do navegador

### Erro de conexão com API:
- Confirme que `VITE_API_URL` aponta para o backend correto
- Teste o endpoint `/health` do backend
- Verifique se o backend está rodando

## 📝 Usuário Admin Padrão

Após o deploy, crie um usuário admin usando o seed ou diretamente no banco:
```
Email: admin@localhost
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere esta senha em produção!
