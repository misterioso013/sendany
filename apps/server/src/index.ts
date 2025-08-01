import "dotenv/config"
import express from "express";
import cors from "cors";
import loginRouter from "./auth/login";
import callbackRouter from "./auth/callback";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth/login', loginRouter);
app.use('/api/auth/callback', callbackRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
