import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
 
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "replace_me";
 
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
 
// User Model skapa modell som nya användare använder sig av, bör innehålla username, email, password
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);
 
// Hjälpfunktion skapa token för att bestämma hur länge man har tillgång till att vara kvar inloggad
const createToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
 
// REGISTER skapa konto och skapa token till kontot, request response
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash });
 
  const token = createToken(user._id);
  res.cookie("token", token, { httpOnly: true });
  res.json({ id: user._id, username: user.username, email: user.email });
});
 
// LOGIN logga in på sitt konto, om rätt uppgifter ge token, om fel uppgifter ge 'felaktiga uppgifter' och invänta rätt uppgifter
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Felaktiga uppgifter" });
  }
 
  const token = createToken(user._id);
  res.cookie("token", token, { httpOnly: true });
  res.json({ id: user._id, username: user.username, email: user.email });
});
 
// ME 
app.get("/api/auth/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ user: null });
 
  const { userId } = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(userId).select("-password");
  res.json({ user: user || null });
});
 
// LOGOUT endast response, ta bort cookie/token
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});
 
// Start starta mongo, konsoll logga vart mongodbb är hostad
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB ansluten");
  app.listen(PORT, () => console.log(`🚀 Server på http://localhost:${PORT}`));
});
 