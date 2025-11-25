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
const FRONTEND_ORIGINS = [
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  "http://localhost:5174", // Additional port for development
];
const JWT_SECRET = process.env.JWT_SECRET || "replace_me";
 
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  }, 
  credentials: true 
}));
 
// User Model skapa modell som nya användare använder sig av, bör innehålla username, email, password
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateJoined: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

// Watchlist Model
const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, required: true }, // "movie", "show", "book", "song"
  itemId: { type: String, required: true }, // unique identifier
  itemTitle: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
});
const Watchlist = mongoose.model("Watchlist", WatchlistSchema);

// Review Model
const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, required: true }, // "movie", "show", "book", "song"
  itemId: { type: String, required: true }, // unique identifier
  itemTitle: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
});
const Review = mongoose.model("Review", ReviewSchema);
 
// Hjälpfunktion skapa token för att bestämma hur länge man har tillgång till att vara kvar inloggad
const createToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

// Middleware to verify authentication
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.userId = userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication" });
  }
};
 
// REGISTER skapa konto och skapa token till kontot, request response
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
   
    const token = createToken(user._id);
    res.cookie("token", token, { httpOnly: true });
    res.json({ _id: user._id, username: user.username, email: user.email, dateJoined: user.dateJoined });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
// LOGIN logga in på sitt konto, om rätt uppgifter ge token, om fel uppgifter ge 'felaktiga uppgifter' och invänta rätt uppgifter
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Felaktiga uppgifter" });
    }
   
    const token = createToken(user._id);
    res.cookie("token", token, { httpOnly: true });
    res.json({ _id: user._id, username: user.username, email: user.email, dateJoined: user.dateJoined });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
// ME 
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });
   
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(userId).select("-password");
    res.json({ user: user || null });
  } catch (error) {
    res.json({ user: null });
  }
});
 
// LOGOUT endast response, ta bort cookie/token
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

// WATCHLIST ENDPOINTS
// Get user's watchlist
app.get("/api/watchlist", verifyAuth, async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.userId }).sort({ dateAdded: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to watchlist
app.post("/api/watchlist", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle } = req.body;
    
    // Check if item already exists in watchlist
    const existing = await Watchlist.findOne({ 
      userId: req.userId, 
      itemId, 
      itemType 
    });
    
    if (existing) {
      return res.status(400).json({ error: "Item already in watchlist" });
    }
    
    const item = await Watchlist.create({
      userId: req.userId,
      itemType,
      itemId,
      itemTitle,
    });
    
    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from watchlist
app.delete("/api/watchlist/:id", verifyAuth, async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REVIEW ENDPOINTS
// Get user's reviews
app.get("/api/reviews", verifyAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId }).sort({ dateCreated: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update review
app.post("/api/reviews", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle, rating, reviewText } = req.body;
    
    if (!reviewText || !itemTitle) {
      return res.status(400).json({ error: "Review text and item title are required" });
    }
    
    // Check if review already exists
    let review = await Review.findOne({ 
      userId: req.userId, 
      itemId, 
      itemType 
    });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.reviewText = reviewText;
      review.dateCreated = new Date();
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        userId: req.userId,
        itemType,
        itemId,
        itemTitle,
        rating,
        reviewText,
      });
    }
    
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review
app.delete("/api/reviews/:id", verifyAuth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get review for specific item
app.get("/api/reviews/:itemType/:itemId", verifyAuth, async (req, res) => {
  try {
    const review = await Review.findOne({ 
      userId: req.userId, 
      itemId: req.params.itemId, 
      itemType: req.params.itemType 
    });
    
    res.json({ review: review || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Start starta mongo, konsoll logga vart mongodbb är hostad
mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("✅ MongoDB ansluten");
  
  // Add dateJoined to existing users who don't have it
  try {
    const usersWithoutDate = await User.updateMany(
      { dateJoined: { $exists: false } },
      { $set: { dateJoined: new Date() } }
    );
    if (usersWithoutDate.modifiedCount > 0) {
      console.log(`📅 Updated ${usersWithoutDate.modifiedCount} users with dateJoined field`);
    }
  } catch (error) {
    console.log("Error updating users:", error.message);
  }
  
  app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server på http://localhost:${PORT}`));
});
 