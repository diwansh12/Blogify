Blogify - Modern Blog Platform
A full-stack blog platform built with React, Node.js, Express, and MongoDB. Share your stories with the world through a beautiful, modern interface.

 Frontend (React + Vite)

Modern UI/UX Design - Beautiful, responsive interface with dark mode support

Real-time Notifications - Bell icon with live notification center

Rich Text Editor - Create posts with images, formatting, and previews

User Profiles - Customizable profiles with stats and social links

Interactive Comments - Nested comments with likes and replies

Theme System - Light/dark mode with font size controls

Mobile Responsive - Optimized for all device sizes

⚡ Backend (Node.js + Express)
RESTful API - Clean, well-documented endpoints

JWT Authentication - Secure user registration and login

File Uploads - Cloudinary integration for images

Comment System - Nested comments with CRUD operations

Notification Engine - Real-time user notifications

Security Features - Rate limiting, CORS, input validation

🗄️ Database & Storage
MongoDB - Document-based storage with Mongoose ODM

Cloudinary - Image upload and optimization

User Management - Secure password hashing with bcrypt

Data Relationships - User posts, comments, and notifications

🚀 Quick Start
Prerequisites
Node.js 18+

MongoDB (local or Atlas)

Cloudinary account

Git

Installation
Clone the repository

bash
git clone https://github.com/diwansh12/blogify.git
cd blogify
Install dependencies

bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
Environment Setup

Create .env file in the root directory:

text
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/blogify

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
Create .env.local in the frontend directory:

text
VITE_API_URL=http://localhost:5000
Start Development Servers

bash
# Start backend server (Terminal 1)
npm run dev

# Start frontend server (Terminal 2)
cd frontend
npm run dev
Open your browser

Frontend: http://localhost:5173

Backend API: http://localhost:5000

📁 Project Structure
text
blogify/
├── 📁 frontend/                 # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── Navbar.jsx       # Navigation with notifications
│   │   │   ├── PostCard.jsx     # Blog post cards
│   │   │   ├── Comments.jsx     # Comment system
│   │   │   └── NotificationDropdown.jsx
│   │   ├── 📁 pages/            # Main application pages
│   │   │   ├── Home.jsx         # Homepage with post grid
│   │   │   ├── Profile.jsx      # User profile page
│   │   │   ├── CreatePost.jsx   # Post creation form
│   │   │   ├── PostDetail.jsx   # Individual post view
│   │   │   ├── Login.jsx        # Authentication
│   │   │   ├── Register.jsx     # User registration
│   │   │   ├── Settings.jsx     # User preferences
│   │   │   └── About.jsx        # About page
│   │   ├── 📁 context/          # React Context providers
│   │   │   ├── AuthContext.jsx  # Authentication state
│   │   │   ├── ThemeContext.jsx # Theme management
│   │   │   └── NotificationContext.jsx
│   │   └── 📁 utils/
│   └── 📄 package.json
├── 📁 backend/                  # Node.js Backend
│   ├── 📄 server.js             # Express server setup
│   ├── 📁 utils/
│   │   └── cloudinary.js        # File upload configuration
│   └── 📄 package.json
├── 📄 .env                      # Environment variables
├── 📄 .gitignore
└── 📄 README.md


🛠️ API Endpoints
Authentication
text
POST   /auth/register          # User registration
POST   /auth/login             # User login
PUT    /auth/profile           # Update user profile
PUT    /auth/password          # Change password
DELETE /auth/account           # Delete account
Posts
text
GET    /posts                  # Get all posts
POST   /posts                  # Create new post (auth required)
GET    /posts/:id              # Get specific post
PUT    /posts/:id              # Update post (auth required)
DELETE /posts/:id              # Delete post (auth required)
Comments
text
GET    /posts/:postId/comments # Get post comments
POST   /posts/:postId/comments # Add comment (auth required)
PUT    /comments/:id           # Update comment (auth required)
DELETE /comments/:id           # Delete comment (auth required)
POST   /comments/:id/like      # Like/unlike comment (auth required)
Notifications
text
GET    /notifications          # Get user notifications (auth required)
POST   /notifications/:id/read # Mark notification as read (auth required)
POST   /notifications/read-all # Mark all notifications as read (auth required)
File Upload
text
POST   /upload                 # Upload image to Cloudinary


🎨 UI/UX Features
Design System
Color Palette: Modern blue/primary color scheme with gradients

Typography: Inter font family with multiple sizes

Spacing: Consistent 8px grid system

Animations: Smooth transitions and micro-interactions

Components: Reusable UI components with consistent styling

Responsive Design
Mobile First: Optimized for mobile devices

Tablet Support: Adaptive layouts for tablets

Desktop Experience: Full-featured desktop interface

Touch Friendly: Large touch targets and gestures

Accessibility
Keyboard Navigation: Full keyboard support

Screen Reader: ARIA labels and semantic HTML

High Contrast: Support for high contrast mode

Reduced Motion: Respects user motion preferences


🔧 Development
Available Scripts
Backend:

bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run lint        # Run ESLint
Frontend:

bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
Code Style
ESLint: JavaScript/React linting

Prettier: Code formatting

Conventional Commits: Commit message convention

Git Workflow
bash
# Feature development
git checkout -b feature/your-feature-name
git commit -m "feat: add new feature"
git push origin feature/your-feature-name

# Create pull request for review
🚀 Deployment
Production Environment
Environment Variables

text
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogify-prod
JWT_SECRET=super-secure-production-secret
CLOUDINARY_CLOUD_NAME=prod-cloud-name
CLOUDINARY_API_KEY=prod-api-key
CLOUDINARY_API_SECRET=prod-api-secret
Build Frontend

bash
cd frontend
npm run build
Deploy Options

AWS: S3 + CloudFront (frontend), EC2/ECS (backend)

Vercel: Frontend deployment

Railway: Backend deployment

DigitalOcean: App Platform deployment

CI/CD Pipeline
Automated deployment with GitHub Actions:

Test: Run tests and linting

Build: Create production builds

Deploy: Deploy to staging/production

Monitor: Health checks and notifications

🧪 Testing
bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
📊 Performance
Frontend Optimization
Code Splitting: Dynamic imports for pages

Image Optimization: Responsive images with lazy loading

Bundle Analysis: Webpack bundle analyzer

Caching: Service worker for offline support

Backend Optimization
Compression: Gzip compression enabled

Rate Limiting: API rate limiting

Database Indexing: Optimized MongoDB queries

Caching: Redis caching layer (optional)

🔒 Security
Frontend Security
XSS Protection: Input sanitization

CSRF Protection: Token-based protection

Content Security Policy: Strict CSP headers

Backend Security
Authentication: JWT with secure secrets

Password Hashing: bcrypt with salt

Rate Limiting: Prevent brute force attacks

Input Validation: Server-side validation

CORS: Configured cross-origin requests

🛡️ Error Handling
Frontend
Error Boundaries: React error boundaries

User Feedback: Toast notifications

Fallback UI: Graceful error states

Backend
Global Error Handler: Centralized error handling

Logging: Structured logging with timestamps

Health Checks: API health monitoring

📈 Monitoring
Application Metrics
Performance: Response times and throughput

Errors: Error rates and types

Users: Active users and engagement

Infrastructure Monitoring
Server Resources: CPU, memory, disk usage

Database: Query performance and connections

CDN: Cache hit rates and performance

🤝 Contributing
Fork the repository

Create feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m 'Add amazing feature'

Push to branch: git push origin feature/amazing-feature

Open Pull Request

Development Guidelines
Follow the existing code style

Add tests for new features

Update documentation

Ensure all tests pass

Write clear commit messages

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
React Team - For the amazing React framework

Vercel - For the Vite build tool

MongoDB - For the flexible database

Cloudinary - For image management

Tailwind CSS - For the utility-first CSS framework

Heroicons - For beautiful SVG icons

📞 Support
Documentation: Check the wiki for detailed guides

Issues: Report bugs via GitHub issues

Discussions: Join community discussions

Email: diwansh1112@gmail.com

🗺️ Roadmap
Version 2.0
 Real-time Features: WebSocket integration

 Social Features: Follow users, feed algorithm

 Advanced Editor: WYSIWYG rich text editor

 SEO Optimization: Meta tags and sitemaps

 Analytics: User behavior analytics

 Mobile App: React Native mobile application

Version 2.1
 Monetization: Premium subscriptions

 Multilingual: Internationalization support

 PWA: Progressive Web App features

 AI Integration: Content suggestions and moderation

<div align="center">
Made with ❤️ by Diwansh Sood