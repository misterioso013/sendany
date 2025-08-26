# SendAny
![GitHub issues](https://img.shields.io/github/issues/misterioso013/sendany)
![GitHub pull requests](https://img.shields.io/github/issues-pr/misterioso013/sendany)
![GitHub license](https://img.shields.io/github/license/misterioso013/sendany)
[![wakatime](https://wakatime.com/badge/github/misterioso013/sendany.svg)](https://wakatime.com/badge/github/misterioso013/sendany)
![GitHub stars](https://img.shields.io/github/stars/misterioso013/sendany)

> Share anything with anyone - The perfect combination of Google Drive, Pastebin, and GitHub Gist.

SendAny is a minimalist and elegant platform for sharing content online. Create workspaces to share text, code, and files with full control over privacy, password protection, and expiration times.

## 🚀 Features

### For Logged In Users
- **Workspaces**: Create workspaces similar to GitHub's Gist
- **Multiple Files**: Add as many files as you want to each workspace
- **Code Editor**: Syntax highlighting for multiple languages
- **Markdown**: Full Markdown support with real-time preview
- **File Upload**: Upload any file type
- **Privacy Control**: Choose between public or private
- **Password Protection**: Add a password for sensitive content
- **Expiration**: Set an automatic expiration date
- **Custom URLs**: Edit the slug for more user-friendly URLs (pending)

### For Logged Out Users
- **Link Access**: View shared workspaces
- **Password Protection**: Enter a password when required
- **Clean Interface**: Optimized viewing experience

## 🛠️ Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI + Origin UI
- **Authentication**: Stack Auth (@stackframe/stack)
- **Database**: PostgreSQL (Neon)
- **Editor**: CodeMirror with syntax highlighting
- **Upload**: Integrated upload system
- **Deployment**: Vercel ready

## 📋 Prerequisites

- Node.js 22+
- pnpm (recommended)
- Neon Database account
- Stack Auth account or Neon Auth (beta)
- Google Cloud Console project (for Google Drive integration)

## 🔐 Google Drive Configuration

To allow users to upload files, you need to set up the Google Drive integration:

### 1. Create a Project in the Google Cloud Console

1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
- Go to "APIs & Services" > "Library"
- Search for "Google Drive API"
- Click "Enable"

### 2. Configure OAuth 2.0

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure:
- Application type: Web application
- Name: SendAny
- Authorized redirect URIs:
- http://localhost:3000/api/auth/google/callback (development)
- https://yourdomain.com/api/auth/google/callback (production)

### 3. Configure OAuth Consent Screen

1. Go to the "OAuth consent screen"
2. Choose "External" (if it's a public app)
3. Fill in the required information:
- **App name**: SendAny
- **User support email**: your-email@example.com
- **Developer contact information**: your-email@example.com

### 4. Add Scopes

On the OAuth consent screen, add the following scopes:
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/userinfo.email`

### 5. Environment Variables

Add the credentials to your `.env.local`:

```env
# Google Drive Integration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 💾 File Storage

### How It Works

1. **Authentication**: User connects their Google Drive account
2. **Structure**: Files are saved in `/SendAny/{workspace_title}/`
3. **Limits**:
- 100MB per file
- 500MB per workspace
- 5GB total per user
4. **Control**: User maintains full control of files in their Drive

### Automatic Cleanup

To configure automatic cleanup of expired workspaces:

```bash
# Configure a cron job to call:
curl -X POST "https://yourdomain.com/api/cleanup" \
-H "x-api-key: your-cleanup-api-key"
```

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/misterioso013/sendany.git
cd sendany
```

### 2. Install the dependencies
```bash
pnpm install
```

### 3. Configure the environment variables
Create a `.env.local` file in the project root using the provided `.env.example` as a reference.

### 4. Configure the database
Run the SQL provided in `database/schema.sql` in your Neon database:

```bash
# Access your Neon console and execute the contents of the file:
cat database/schema.sql
```

### 5. Run the project
```bash
pnpm dev
```

The project will be available at `http://localhost:3000`

## 🗄️ Structure Database Tables

### Main Tables

#### `workspaces`
- Stores workspace information
- Controls visibility, expiration, and password protection
- Relates to Stack Auth users

#### `workspace_files`
- Stores files within workspaces
- Supports text, code, markdown, and uploads
- Maintains file order

#### `workspace_views`
- Basic view analytics
- Tracks IPs and user agents


## 🎨 Core Components

### WorkspaceEditor
Main editor that combines:
- Sidebar file list
- CodeMirror editor
- Upload system
- Workspace settings

### CodeEditor
- Automatic syntax highlighting
- Multiple language support
- Markdown preview
- Light/dark themes

### FileUploader
- Drag & drop
- File validation
- Image preview
- Size control

## 🔒 Security

- **Authentication**: Stack Auth with JWT
- **Password Protection**: bcrypt for hashing
- **Sanitization**: Input validation
- **Rate Limiting**: Ready for deployment
- **CORS**: Proper configuration

## 🚀 Deploy

### Vercel (Recommended)
```bash
# Install the Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in the dashboard Vercel
```

## 🧪 Development

### Available Scripts
```bash
pnpm dev # Development
pnpm build # Build for production
pnpm start # Production server
pnpm lint # Linting
```

### Stack Auth Configuration
```bash
# Run to automatically configure Stack Auth
npx @stackframe/init-stack . --no-browser
```

## 📝 Usage

### 1. Create Workspace
- Log in or create an account
- Click "Create Workspace"
- Add files (text, code, uploads)
- Set privacy and options
- Save and share

### 2. Share
- Copy the generated link
- Set a password if necessary
- Set an expiration date
- Share with whoever you want

### 3. Access Content
- Anyone can access via the link
- Enter a password if prompted
- View all workspace content

## 🤝 Contributing
Interested in contributing? Check out our [Contributing Guide](CONTRIBUTING.md)!

## 🐛 Issues
Found a bug? Have a feature request? [Create an issue](https://github.com/misterioso013/sendany/issues/new/choose)!

## 💬 Community
- [Discussions](https://github.com/misterioso013/sendany/discussions) - For questions and ideas
- [Discord](https://discord.gg/F4WBXeyaVa) - For real-time chat

## 📄 License

This project is licensed under the GPL v3. See the [LICENSE](/LICENSE) file for more details.

## 🔧 Complete Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn UI + Origin UI
- **Editor**: CodeMirror 6
- **Markdown**: react-markdown + remark-gfm
- **Authentication**: Stack Auth
- **Database**: PostgreSQL (Neon)
- **ORM**: Neon Serverless Driver
- **Validation**: Zod
- **Encryption**: bcryptjs
- **IDs**: nanoid
- **Deployment**: Vercel
- **Manager**: pnpm

---
**SendAny** - Share anything with anyone. 🚀
