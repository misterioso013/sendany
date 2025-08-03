# Configuração para Produção

## Domínios
- API: api.yourdomain.com
- Frontend: app.yourdomain.com ou yourdomain.com

## Variáveis de Ambiente (Produção)

### Backend (.env)
```
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/callback
CLIENT_URL=https://app.yourdomain.com
PORT=5000
DATABASE_URL=your_neon_database_url
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

## Configurações de Cookie Cross-Domain

O sistema está configurado para funcionar com:
- **httpOnly**: true (segurança)
- **secure**: true em produção (HTTPS obrigatório)
- **sameSite**: 'none' em produção (cross-domain)
- **domain**: '.yourdomain.com' (permite subdomínios)

## Configurações de CORS

O CORS está configurado para permitir:
- Múltiplas origens em produção
- Credentials true para cookies
- Headers necessários para autenticação

## Banco de Dados

O sistema utiliza PostgreSQL (Neon) com as seguintes tabelas:
- `user_sessions`: Dados dos usuários e tokens Google
- `sessions`: Sessões ativas com expiração
- `workspaces`: Espaços de trabalho
- `workspace_members`: Membros dos workspaces
- `workspace_items`: Itens compartilhados

## Deployment

1. Configure as variáveis de ambiente
2. Faça build do frontend: `pnpm build`
3. Deploy do backend em api.yourdomain.com
4. Deploy do frontend em app.yourdomain.com
5. Configure SSL/HTTPS para ambos domínios

## Segurança

- Tokens Google armazenados criptografados no banco
- Sessões com expiração automática (7 dias)
- Limpeza automática de sessões expiradas
- Cookies seguros em produção
