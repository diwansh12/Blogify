import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { storage } from "./utils/cloudinary.js";

dotenv.config();
const app = express();


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});


// Middlewares
app.use(cors());
app.use(express.json());

// File Upload
const upload = multer({ storage });
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file?.path) {
    return res.status(400).json({ message: "Upload failed" });
  }
  res.json({ url: req.file.path });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Blog Schema
const BlogSchema = new mongoose.Schema(
  {
    title: String,
    summary: String,
    author: String,
    content: String,
    image: String,
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Comment Schema
const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxLength: 1000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date }
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);


// Notification Schema
const NotificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['comment','like'], required: true },
  message: String,
  link:    String,
  isRead:  { type: Boolean, default: false }
},{ timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema);


// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Authorization:", authHeader);

  const token = authHeader?.split(" ")[1];
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Invalid token:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ===== BLOG ROUTES =====

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create post
app.post("/posts", auth, async (req, res) => {
  try {
    const newPost = new Blog({ ...req.body, author: req.user.id });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get post by ID
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update post
app.put("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author !== req.user.id) {
      return res.status(403).json({ message: "You are not the author of this post" });
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete post
app.delete("/posts/:id", auth, async (req, res) => {
  try {
    console.log("🗑️ Delete request for post:", req.params.id);
    console.log("👤 User ID from token:", req.user.id);
    
    const post = await Blog.findById(req.params.id);
    
    if (!post) {
      console.log("❌ Post not found");
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log("📝 Post author:", post.author);
    
    if (post.author !== req.user.id) {
      console.log("❌ User not authorized to delete this post");
      return res.status(403).json({ message: "You are not the author of this post" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    console.log("✅ Post deleted successfully");
    
    res.json({ message: "Post deleted successfully" });
    
  } catch (error) {
    console.error("❌ Delete route error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ===== COMMENT ROUTES =====

// Get comments for a post
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    console.log("📝 Fetching comments for post:", req.params.postId);
    
    const comments = await Comment.find({ 
      postId: req.params.postId,
      parentComment: null
    })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name email')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    console.log(`✅ Found ${comments.length} comments for post ${req.params.postId}`);
    res.json(commentsWithReplies);
  } catch (error) {
    console.error("❌ Comments fetch error:", error);
    res.status(500).json({ 
      error: "Failed to fetch comments", 
      details: error.message 
    });
  }
});

// Add a comment
app.post("/posts/:postId/comments", auth, async (req, res) => {
  try {
    console.log("💬 Creating comment for post:", req.params.postId);
    
    const { content, parentComment } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }
    
    const comment = new Comment({
      postId: req.params.postId,
      author: req.user.id,
      content: content.trim(),
      parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('author', 'name email');

    console.log("✅ Comment created successfully");
    res.status(201).json(comment);
    // After you save a comment:
const post = await Blog.findById(req.params.postId);
if (post && post.author !== req.user.id.toString()) {
  await Notification.create({
    user:    post.author,
    type:    'comment',
    message: `${req.user.name} commented on your post`,
    link:    `/post/${req.params.postId}`
  });
}
  } catch (error) {
    console.error("❌ Create comment error:", error);
    res.status(500).json({ 
      error: "Failed to create comment", 
      details: error.message 
    });
  }
});

// Update comment
app.put("/comments/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to edit this comment" });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    await comment.populate('author', 'name email');

    res.json(comment);
  } catch (error) {
    console.error("❌ Update comment error:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete comment
app.delete("/comments/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("❌ Delete comment error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Like/Unlike comment
app.post("/comments/:id/like", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user.id;
    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, hasLiked: !hasLiked });
    const original = await Comment.findById(req.params.id);
if (original.author.toString() !== req.user.id) {
  await Notification.create({
    user:    original.author,
    type:    'like',
    message: `${req.user.name} liked your comment`,
    link:    `/post/${original.postId}#comment-${original._id}`
  });
}
  } catch (error) {
    console.error("❌ Like comment error:", error);
    res.status(500).json({ error: "Failed to like comment" });
  }
});

// GET /notifications → fetch a user’s notifications
app.get("/notifications", auth, async (req, res) => {
  try {
    const notes = await Notification
      .find({ user: req.user.id })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(50);
    res.json(notes);
  } catch (err) {
    console.error("❌ fetch notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /notifications/:id/read → mark one read
app.post("/notifications/:id/read", auth, async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note || note.user.toString() !== req.user.id)
      return res.status(404).json({ error: "Not found" });

    note.isRead = true;
    await note.save();
    res.json(note);
  } catch (err) {
    console.error("❌ mark read:", err);
    res.status(500).json({ error: "Failed to mark read" });
  }
});

// POST /notifications/read-all → mark all as read
app.post("/notifications/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All read" });
  } catch (err) {
    console.error("❌ mark all read:", err);
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

// ===== AUTH ROUTES =====

// Register
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  const missing = [];
  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!password) missing.push("password");

  if (missing.length > 0) {
    return res.status(400).json({
      message: "Missing required fields",
      missing,
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login - FIXED
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {  // ✅ Added await
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name,
        email: user.email 
      } 
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("✅ Blogify backend is running!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});