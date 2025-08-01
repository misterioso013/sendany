# 📨 sendany

**sendany** é uma aplicação híbrida para envio rápido de arquivos, textos, imagens, links e outros conteúdos entre diferentes dispositivos — desktop, mobile, Android, Ubuntu ou Windows — com suporte tanto a **compartilhamento local via Wi-Fi** quanto a **upload em nuvem (Google Drive)**.

Desenvolvido para eliminar a dependência de apps de terceiros como WhatsApp, Telegram ou Pastebin para tarefas simples e frequentes.

---

## 🚀 Funcionalidades

| Recurso                        | Nuvem (Drive) | Local (Wi-Fi) |
|-------------------------------|---------------|---------------|
| Upload de arquivos            | ✅            | ✅            |
| Envio de links e textos       | ✅ (.txt/md)  | ✅ (mensagem direta) |
| QR Code para acesso rápido    | ✅            | ✅            |
| Copiar/colar cross-device     | ✅            | ✅            |
| Instalação como PWA           | ✅            | ✅            |
| Expiração automática (opcional) | 🔜          | 🔜            |
| Lista de itens enviados       | ✅            | 🔴 (modo volátil) |
| Notificações push             | 🔜            | 🔜            |

---

## 🧱 Estrutura do Projeto (Monorepo)

```

sendany/
├── apps/
│   ├── web/            # Frontend Next.js com suporte PWA
│   └── server/         # Backend Node.js com Drive API + WebSocket
├── packages/
│   ├── drive-sdk/      # Wrapper interno para Google Drive
│   ├── lan-share/      # Biblioteca de comunicação via WebRTC/WebSocket
│   └── ui/             # Componentes visuais com Tailwind + shadcn/ui
├── turbo.json          # Configuração de monorepo com Turborepo
└── README.md

````

---

## ⚙️ Tecnologias Utilizadas

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + WebSocket
- **Local Sharing:** WebRTC DataChannel (P2P) + WebSocket fallback
- **Nuvem:** Google Drive API v3 com OAuth2
- **Build Tooling:** Turborepo + TypeScript + Eslint + Prettier
- **Outros:** QRCode, Clipboard API, PWA Support

---

## 📦 Como usar

### 1. Clonar o repositório

```bash
git clone https://github.com/misterioso013/sendany.git
cd sendany
````

### 2. Instalar dependências

```bash
pnpm install
# ou npm install
```

### 3. Configurar variáveis de ambiente

Crie arquivos `.env` nas pastas `apps/web` e `apps/server`:

#### `apps/server/.env`

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DRIVE_FOLDER_ID=opcional
```

### 4. Rodar o ambiente local

```bash
pnpm dev
# ou
turbo dev
```

---

## 🌐 Modos de Operação

### 🔹 Modo 1 – Google Drive

* Ideal para arquivos maiores, persistência e uso multi-dispositivo.
* Itens ficam salvos até que sejam excluídos manualmente.
* Exibição com miniaturas e opção de download direto.

### 🔸 Modo 2 – Wi-Fi (LAN Sharing)

* Envio peer-to-peer de arquivos e mensagens.
* Zero upload: os arquivos vão direto de um device para o outro.
* Ideal para momentos rápidos e conexões locais.

---

## 📱 Como usar no celular

1. Acesse o app via navegador (`http://<seu-ip>:3000`)
2. Instale como **PWA** no Android (Adicionar à tela inicial)
3. Escaneie o QR Code de outro dispositivo para receber arquivos
4. Toque para baixar, copiar ou visualizar

---

## 📌 TODO (Roadmap)

* [ ] Suporte completo a WebRTC DataChannel (LAN mode)
* [ ] Notificações push com Firebase
* [ ] Expiração automática de arquivos (configurável)
* [ ] Upload direto para Drive em pastas por data ou device
* [ ] Tema escuro/claro com persistência
* [ ] Extensão para navegador

---

## 📄 Licença

Este projeto está sob a licença [GPL v3](LICENSE).

---

## ✨ Contribuição

Apesar de ser um projeto de uso pessoal, contribuições são bem-vindas para evoluir a ideia. Sinta-se livre para sugerir melhorias, reportar bugs ou abrir PRs.

---

## 🧠 Motivação

Cansado de usar o WhatsApp para mandar arquivos para mim mesmo, criei o sendany para facilitar minha rotina como dev multitarefa. A solução precisava ser leve, instantânea e funcionar tanto online quanto offline.