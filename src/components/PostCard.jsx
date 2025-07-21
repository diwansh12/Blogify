// components/BlogCard.jsx
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  UserIcon, 
  ClockIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EyeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function BlogCard({ post, index }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 10);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const estimateReadTime = (content) => {
    const words = content?.split(' ').length || 0;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const truncateText = (text, maxLength) => {
    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength) + '...';
  };

  return (
    <article 
      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 animate-fade-in transform hover:-translate-y-2 ${
        index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''
      }`} 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link to={`/post/${post._id}`} className="block h-full">
        
        {/* Image Container */}
        <div className={`relative overflow-hidden ${
          index % 5 === 0 ? 'h-64' : 'h-48'
        }`}>
          {post.image ? (
            <>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-blue-50 flex items-center justify-center">
              <BookOpenIcon className="w-16 h-16 text-primary-300" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-primary-600 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Technology
            </span>
          </div>

          {/* Reading Time */}
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{estimateReadTime(post.content)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 ${index % 5 === 0 ? 'p-8' : ''}`}>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {post.author?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.author}</p>
                <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-400">
              <EyeIcon className="w-4 h-4" />
              <span className="text-xs">{Math.floor(Math.random() * 1000) + 100}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className={`font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight ${
            index % 5 === 0 ? 'text-2xl mb-4' : 'text-xl'
          }`}>
            {post.title}
          </h2>

          {/* Summary */}
          <p className={`text-gray-600 leading-relaxed mb-6 ${
            index % 5 === 0 ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'
          }`}>
            {post.summary || truncateText(post.content, index % 5 === 0 ? 200 : 120)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors duration-200 group/like"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500 group-hover/like:scale-125 transition-transform" />
                ) : (
                  <HeartIcon className="w-5 h-5 group-hover/like:scale-125 transition-transform" />
                )}
                <span className="text-sm font-medium">{likes}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 group/comment">
                <ChatBubbleLeftIcon className="w-5 h-5 group-hover/comment:scale-125 transition-transform" />
                <span className="text-sm font-medium">{Math.floor(Math.random() * 50) + 5}</span>
              </button>
            </div>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200 group/share">
              <ShareIcon className="w-5 h-5 group-hover/share:scale-125 transition-transform" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-600/0 to-primary-600/0 group-hover:from-primary-600/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
      </Link>
    </article>
  );
}
