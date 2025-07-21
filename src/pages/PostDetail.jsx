import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Comments from '../components/Comments';
import api from "../api";
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  EyeIcon,
  HeartIcon,
  ShareIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPost(res.data);
        setLikes(Math.floor(Math.random() * 100) + 10);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch post:", err);
        if (err?.response?.status === 401) {
          alert("Unauthorized. Please log in again.");
          navigate("/login");
        } else {
          alert("Post not found.");
          navigate("/");
        }
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    const token = localStorage.getItem("token");

    try {
      await api.delete(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to delete post:", err);
      alert("Failed to delete the post. Please try again.");
      setDeleteLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content) => {
    const words = content?.split(' ').length || 0;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h2>
          <p className="text-gray-600 mb-8">The story you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && (user.id === post.author || user.name === post.author);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      
      {/* Hero Section */}
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-8 group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          {/* Post Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.summary && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                {post.summary}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {post.author?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-center space-x-6 text-gray-500 mb-8">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>{estimateReadTime(post.content)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <EyeIcon className="w-5 h-5" />
                <span>{Math.floor(Math.random() * 1000) + 100} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-full transition-colors group"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                ) : (
                  <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-medium">{likes}</span>
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-full transition-colors group"
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
                ) : (
                  <BookmarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-medium">Save</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-full transition-colors group"
              >
                <ShareIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Featured Image */}
          {post.image && (
            <div className="mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                  {post.content}
                </div>
              </div>
            </div>
          </article>

          {/* Author Actions */}
          {isAuthor && (
            <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all transform hover:-translate-y-1"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>Edit Story</span>
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-5 h-5" />
                    <span>Delete Story</span>
                  </>
                )}
              </button>
            </div>
          )}
          <div>
           <Comments postId={id} />
           </div>
          </div>
        </div>
      </div>
  );
}

