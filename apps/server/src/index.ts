import "dotenv/config"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import loginRouter from "./auth/login";
import callbackRouter from "./auth/callback";
import logoutRouter from "./auth/logout";
import workspacesRouter from "./routes/workspaces";
import itemsRouter from "./routes/items";
import userRouter from "./routes/user";
import { testConnection } from "./database/config";
import { SessionService } from "./database/user.service";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://app.yourdomain.com'] // Configure seus domínios
    : [process.env.CLIENT_URL || "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Debug middleware para cookies
app.use((req, res, next) => {
  console.log('Cookies recebidos:', req.cookies);
  next();
});

app.use('/api/auth/login', loginRouter);
app.use('/api/auth/callback', callbackRouter);
app.use('/api/auth/logout', logoutRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/workspaces', itemsRouter); // Items routes for workspaces
app.use('/api/user', userRouter);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Test database connection
  try {
    await testConnection();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
  
  // Limpar sessões expiradas a cada hora
  const sessionService = new SessionService();
  setInterval(async () => {
    try {
      const cleanedCount = await SessionService.cleanExpiredSessions();
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }, 60 * 60 * 1000); // 1 hora
});
