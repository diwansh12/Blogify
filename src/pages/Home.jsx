
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import { 
  ArrowTrendingUpIcon, 
  FireIcon, 
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(res.data);
        setFeaturedPost(res.data[0]);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch posts:", err);
        setError("Failed to load posts. Please try again later.");
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Loading Component
  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg">Loading amazing stories...</p>
      </div>
    </div>
  );

  // Error Component
  const ErrorMessage = () => (
    <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-blue-600/5"></div>
        <div className="relative max-w-7xl mx-auto">
          
          {/* Hero Content */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-in">
              <SparklesIcon className="w-4 h-4" />
              <span>Welcome to the future of blogging</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-fade-in">
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Blogify
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Discover incredible stories, connect with passionate writers, and share your unique voice with the world. 
              <span className="text-primary-600 font-semibold"> Your story matters.</span>
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-500 via-primary-600 to-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-primary-500/25 transition-all transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <span>Start Your Journey</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-primary-500 text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all transform hover:-translate-y-1"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-primary-600 mb-2">{posts.length}+</div>
              <div className="text-gray-600">Amazing Stories</div>
            </div>
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-primary-600 mb-2">1M+</div>
              <div className="text-gray-600">Monthly Readers</div>
            </div>
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Community Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-8 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Story</h2>
                <p className="text-gray-600">Don't miss this amazing piece</p>
              </div>
            </div>
            
            <Link to={`/post/${featuredPost._id}`} className="group block animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="lg:flex">
                  {featuredPost.image && (
                    <div className="lg:w-1/2 h-80 lg:h-auto">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {featuredPost.author?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{featuredPost.author}</p>
                        <p className="text-sm text-gray-500">Featured Author</p>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {featuredPost.title}
                    </h3>
                    
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      {featuredPost.summary}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>5 min read</span>
                      </span>
                      <span>•</span>
                      <span>Trending</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Latest Stories */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Latest Stories</h2>
                <p className="text-gray-600">Fresh content from our community</p>
              </div>
            </div>
            
            <Link
              to="/browse"
              className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No stories yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Be the first to share your story with our community. Your voice matters!
              </p>
              {user ? (
                <Link
                  to="/create"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Write Your First Story
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Join Our Community
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post, index) => (
                <PostCard key={post._id} post={post} index={index + 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of writers who are already sharing their passion and connecting with readers worldwide.
          </p>
          
          {user ? (
            <Link
              to="/create"
              className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 inline-flex items-center space-x-2"
            >
              <span>Start Writing Now</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Join Free Today
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transition-all transform hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
