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

// Thumbs Up/Down Model
const ThumbsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, required: true }, // "movie", "show", "book", "song"
  itemId: { type: String, required: true }, // unique identifier
  itemTitle: { type: String, required: true },
  voteType: { type: String, enum: ['up', 'down'], required: true },
  dateCreated: { type: Date, default: Date.now },
});

// Ensure a user can only vote once per item
ThumbsSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

const Thumbs = mongoose.model("Thumbs", ThumbsSchema);
 
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

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working", timestamp: new Date().toISOString() });
});

// Get aggregated ratings for a specific item (public endpoint)
app.get("/api/ratings/:itemType/:itemId", async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    // Get all ratings for this item
    const reviews = await Review.find({ itemType, itemId }).select('rating');
    
    if (reviews.length === 0) {
      return res.json({ 
        itemType, 
        itemId, 
        median: null, 
        average: null, 
        count: 0,
        ratings: []
      });
    }
    
    const ratings = reviews.map(r => r.rating).filter(r => r != null);
    
    if (ratings.length === 0) {
      return res.json({ 
        itemType, 
        itemId, 
        median: null, 
        average: null, 
        count: 0,
        ratings: []
      });
    }
    
    // Calculate median
    const sortedRatings = ratings.sort((a, b) => a - b);
    const median = sortedRatings.length % 2 === 0
      ? (sortedRatings[sortedRatings.length / 2 - 1] + sortedRatings[sortedRatings.length / 2]) / 2
      : sortedRatings[Math.floor(sortedRatings.length / 2)];
    
    // Calculate average
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    // Count distribution
    const distribution = [1, 2, 3, 4, 5].map(star => 
      ratings.filter(r => r === star).length
    );
    
    res.json({
      itemType,
      itemId,
      median: Math.round(median * 10) / 10, // Round to 1 decimal
      average: Math.round(average * 10) / 10,
      count: ratings.length,
      distribution, // [count of 1s, count of 2s, count of 3s, count of 4s, count of 5s]
      ratings: ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// THUMBS UP/DOWN ENDPOINTS

// Get thumbs up/down counts for a specific item (public endpoint)
app.get("/api/thumbs/:itemType/:itemId", async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    const thumbsUp = await Thumbs.countDocuments({ itemType, itemId, voteType: 'up' });
    const thumbsDown = await Thumbs.countDocuments({ itemType, itemId, voteType: 'down' });
    
    res.json({
      itemType,
      itemId,
      thumbsUp,
      thumbsDown,
      total: thumbsUp + thumbsDown,
      ratio: thumbsUp + thumbsDown > 0 ? thumbsUp / (thumbsUp + thumbsDown) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's vote for a specific item
app.get("/api/thumbs/:itemType/:itemId/user", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    const userVote = await Thumbs.findOne({
      userId: req.userId,
      itemType,
      itemId
    });
    
    res.json({
      userVote: userVote ? userVote.voteType : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update thumbs up/down vote
app.post("/api/thumbs", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle, voteType } = req.body;
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: "voteType must be 'up' or 'down'" });
    }
    
    // Check if user already voted
    let existingVote = await Thumbs.findOne({
      userId: req.userId,
      itemType,
      itemId
    });
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote - remove it (toggle off)
        await Thumbs.deleteOne({ _id: existingVote._id });
        return res.json({ 
          action: 'removed',
          previousVote: voteType,
          currentVote: null
        });
      } else {
        // Different vote - update it
        existingVote.voteType = voteType;
        existingVote.dateCreated = new Date();
        await existingVote.save();
        return res.json({ 
          action: 'updated',
          previousVote: existingVote.voteType === 'up' ? 'down' : 'up',
          currentVote: voteType,
          vote: existingVote
        });
      }
    } else {
      // New vote
      const newVote = await Thumbs.create({
        userId: req.userId,
        itemType,
        itemId,
        itemTitle,
        voteType
      });
      
      return res.json({ 
        action: 'created',
        previousVote: null,
        currentVote: voteType,
        vote: newVote
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove thumbs vote
app.delete("/api/thumbs/:itemType/:itemId", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    const deletedVote = await Thumbs.findOneAndDelete({
      userId: req.userId,
      itemType,
      itemId
    });
    
    if (!deletedVote) {
      return res.status(404).json({ error: "Vote not found" });
    }
    
    res.json({ 
      action: 'removed',
      deletedVote: deletedVote.voteType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bulk thumbs data for multiple items
app.post("/api/thumbs/bulk", async (req, res) => {
  try {
    const { items } = req.body; // Array of {itemType, itemId}
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required" });
    }
    
    const results = [];
    
    for (const { itemType, itemId } of items) {
      const thumbsUp = await Thumbs.countDocuments({ itemType, itemId, voteType: 'up' });
      const thumbsDown = await Thumbs.countDocuments({ itemType, itemId, voteType: 'down' });
      
      results.push({
        itemType,
        itemId,
        thumbsUp,
        thumbsDown,
        total: thumbsUp + thumbsDown,
        ratio: thumbsUp + thumbsDown > 0 ? thumbsUp / (thumbsUp + thumbsDown) : 0
      });
    }
    
    res.json({ thumbs: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aggregated ratings for multiple items (bulk endpoint)
app.post("/api/ratings/bulk", async (req, res) => {
  try {
    const { items } = req.body; // Array of {itemType, itemId}
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required" });
    }
    
    const results = [];
    
    for (const { itemType, itemId } of items) {
      const reviews = await Review.find({ itemType, itemId }).select('rating');
      const ratings = reviews.map(r => r.rating).filter(r => r != null);
      
      if (ratings.length === 0) {
        results.push({
          itemType,
          itemId,
          median: null,
          average: null,
          count: 0
        });
        continue;
      }
      
      const sortedRatings = ratings.sort((a, b) => a - b);
      const median = sortedRatings.length % 2 === 0
        ? (sortedRatings[sortedRatings.length / 2 - 1] + sortedRatings[sortedRatings.length / 2]) / 2
        : sortedRatings[Math.floor(sortedRatings.length / 2)];
      
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      results.push({
        itemType,
        itemId,
        median: Math.round(median * 10) / 10,
        average: Math.round(average * 10) / 10,
        count: ratings.length
      });
    }
    
    res.json({ ratings: results });
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
 