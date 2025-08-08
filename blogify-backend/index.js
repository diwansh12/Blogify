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

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    throw err;
  }
};

const withDB = (handler) => async (req, res) => {
  await connectDB();
  return handler(req, res);
};

app.use(cors({
  origin: [
    'https://blogify-phi-seven.vercel.app/',
    'http://localhost:3000'
  ], // Allow all origins for now
  credentials: true
}));

app.use(express.json());

// Test endpoint to verify server is working
app.get("/test", withDB((req, res) => {
  res.json({ message: "Server is working!" });
}))

// File Upload
const upload = multer({ storage });
app.post("/upload", withDB(upload.single("image")), (req, res) => {
  if (!req.file?.path) {
    return res.status(400).json({ message: "Upload failed" });
  }
  res.json({ url: req.file.path });
});


// Schemas
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

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", UserSchema);

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

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['comment','like'], required: true },
  message: String,
  link: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema);

// ✅ FIXED Auth middleware - now includes user name
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ===== BLOG ROUTES =====
app.get("/posts", withDB(async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
}));

app.post("/posts", auth, withDB(async (req, res) => {
  try {
    const newPost = new Blog({ ...req.body, author: req.user.id });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
}));

app.get("/posts/:id", withDB(async (req, res) => {
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
}));

app.put("/posts/:id", auth, withDB(async (req, res) => {
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
}));

app.delete("/posts/:id", auth, withDB(async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    if (post.author !== req.user.id) {
      return res.status(403).json({ message: "You are not the author of this post" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
    
  } catch (error) {
    console.error("❌ Delete route error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}));

// ===== COMMENT ROUTES =====
app.get("/posts/:postId/comments", withDB(async (req, res) => {
  try {
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

    res.json(commentsWithReplies);
  } catch (error) {
    console.error("❌ Comments fetch error:", error);
    res.status(500).json({ 
      error: "Failed to fetch comments", 
      details: error.message 
    });
  }
}));

// ✅ FIXED Add comment with proper notification handling
app.post("/posts/:postId/comments", auth, withDB(async (req, res) => {
  try {
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

    // ✅ FIXED: Proper notification handling inside try-catch
    try {
      const post = await Blog.findById(req.params.postId);
      if (post && post.author !== req.user.id.toString()) {
        await Notification.create({
          user: post.author,
          type: 'comment',
          message: `${req.user.name || 'Someone'} commented on your post`,
          link: `/post/${req.params.postId}`
        });
      }
    } catch (notifError) {
      console.error("❌ Notification error:", notifError);
      // Don't fail comment creation if notification fails
    }

    res.status(201).json(comment);
    
  } catch (error) {
    console.error("❌ Create comment error:", error);
    res.status(500).json({ 
      error: "Failed to create comment", 
      details: error.message 
    });
  }
}));

app.put("/comments/:id", auth, withDB(async (req, res) => {
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
}));

app.delete("/comments/:id", auth, withDB(async (req, res) => {
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
}));

// ✅ FIXED Like comment with proper notification handling
app.post("/comments/:id/like", auth, withDB(async (req, res) => {
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
      
      // ✅ FIXED: Only create notification when liking (not unliking)
      try {
        if (comment.author.toString() !== req.user.id) {
          await Notification.create({
            user: comment.author,
            type: 'like',
            message: `${req.user.name || 'Someone'} liked your comment`,
            link: `/post/${comment.postId}#comment-${comment._id}`
          });
        }
      } catch (notifError) {
        console.error("❌ Notification error:", notifError);
        // Don't fail the like if notification fails
      }
    }

    await comment.save();
    res.json({ likes: comment.likes.length, hasLiked: !hasLiked });
    
  } catch (error) {
    console.error("❌ Like comment error:", error);
    res.status(500).json({ error: "Failed to like comment" });
  }
}));

// ===== NOTIFICATION ROUTES =====
app.get("/notifications", auth, withDB(async (req, res) => {
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
}));

app.post("/notifications/:id/read", auth, withDB(async (req, res) => {
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
}));

app.post("/notifications/read-all", auth, withDB(async (req, res) => {
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
}));

// ===== AUTH ROUTES =====
app.post("/auth/register", withDB(async (req, res) => {
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
}));

// ✅ FIXED Login - now includes user name in JWT
app.post("/auth/login", withDB(async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name,  // ✅ Added name to JWT
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

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
}));

// Root route
app.get("/", (req, res) => {
  res.send("✅ Blogify backend is running!");
});


export default app;
