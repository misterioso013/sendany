import "dotenv/config"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import loginRouter from "./auth/login";
import callbackRouter from "./auth/callback";
import workspacesRouter from "./routes/workspaces";
import itemsRouter from "./routes/items";
import userRouter from "./routes/user";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth/login', loginRouter);
app.use('/api/auth/callback', callbackRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/workspaces', itemsRouter); // Items are nested under workspaces
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
